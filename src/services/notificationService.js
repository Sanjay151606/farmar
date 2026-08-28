const https = require('https');
const store = require('../models/store');
const { supabase, isSupabaseEnabled } = require('../config/supabase');

/**
 * Generate Direct WhatsApp Click-to-Chat Deep-link (100% Free & Works Anywhere)
 */
function generateWhatsAppLink(phone, message) {
  let cleanPhone = (phone || '').replace(/[^\d]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone; // Default to India country code
  }
  const encodedMsg = encodeURIComponent(message || '');
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
}

/**
 * Send Real SMS via Twilio (if credentials configured in Vercel environment)
 */
async function sendTwilioSms({ to, message }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromPhone) {
    return { success: false, reason: 'Twilio credentials not configured in environment' };
  }

  let targetPhone = to.replace(/[^\d+]/g, '');
  if (!targetPhone.startsWith('+')) {
    targetPhone = targetPhone.length === 10 ? `+91${targetPhone}` : `+${targetPhone}`;
  }

  return new Promise((resolve) => {
    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const postData = new URLSearchParams({
      To: targetPhone,
      From: fromPhone,
      Body: message
    }).toString();

    const req = https.request({
      hostname: 'api.twilio.com',
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, sid: parsed.sid, provider: 'twilio_sms' });
          } else {
            resolve({ success: false, error: parsed.message || 'Twilio Error' });
          }
        } catch (e) {
          resolve({ success: false, error: 'Parse Error' });
        }
      });
    });

    req.on('error', (err) => resolve({ success: false, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'Timeout' }); });
    req.write(postData);
    req.end();
  });
}

/**
 * Main Notification Dispatcher
 */
const notificationService = {
  generateWhatsAppLink,
  sendTwilioSms,

  async notifyOrderEvent(eventType, order) {
    if (!order) return;

    let title = 'Order Update';
    let msgEnglish = '';
    let msgTamil = '';

    const firstItem = order.items && order.items[0] ? order.items[0] : { name: 'Harvest Produce', quantity: 1, unit: 'kg' };
    const trackingUrl = `https://farmar-lake.vercel.app/tracker.html?orderId=${order.id}`;

    switch (eventType) {
      case 'order_created':
        title = `🌱 New Order ${order.id} Placed!`;
        msgEnglish = `FARMORA: New Order ${order.id} received for ${firstItem.name} (${firstItem.quantity} ${firstItem.unit}). Total: ₹${order.totalAmount}. Farmer: ${order.farmerName}.`;
        msgTamil = `FARMORA: புதிய ஆர்டர் ${order.id} பெறப்பட்டது! பொருள்: ${firstItem.name}. தொகை: ₹${order.totalAmount}.`;
        break;

      case 'order_picked_up':
        title = `🚚 Order ${order.id} Picked Up!`;
        msgEnglish = `FARMORA: Order ${order.id} has been picked up by delivery partner ${order.deliveryBoyName || ''}. Live Tracking: ${trackingUrl}`;
        msgTamil = `FARMORA: உங்கள் ஆர்டர் ${order.id} டெலிவரிக்கு புறப்பட்டது! லைவ் டிராக்கிங்: ${trackingUrl}`;
        break;

      case 'order_delivered':
        title = `✅ Order ${order.id} Delivered!`;
        msgEnglish = `FARMORA: Order ${order.id} delivered successfully to ${order.customerName}! Payment of ₹${order.totalAmount} settled to ${order.farmerName}.`;
        msgTamil = `FARMORA: ஆர்டர் ${order.id} வெற்றிகரமாக டெலிவரி செய்யப்பட்டது! ₹${order.totalAmount} விவசாயிக்கு விடுவிக்கப்பட்டது.`;
        break;

      default:
        title = `Order Status: ${order.status}`;
        msgEnglish = `Order ${order.id} status updated to ${order.status}.`;
        msgTamil = `ஆர்டர் ${order.id} நிலை மாற்றப்பட்டது: ${order.status}.`;
    }

    const combinedMessage = `${msgEnglish}\n\n${msgTamil}`;

    // 1. Generate WhatsApp 1-Click Link
    const customerPhone = order.customerPhone || '9876543210';
    const whatsappUrl = generateWhatsAppLink(customerPhone, combinedMessage);

    // 2. Attempt Twilio SMS if keys are set
    const twilioResult = await sendTwilioSms({ to: customerPhone, message: msgEnglish });

    // 3. Record in Supabase Notifications table
    if (isSupabaseEnabled()) {
      try {
        await supabase.from('notifications').insert({
          user_name: order.customerName,
          title: title,
          message: combinedMessage,
          is_read: false
        });
      } catch (err) {
        console.warn('Supabase notification insert note:', err.message);
      }
    }

    // 4. Save to local store
    const localNotif = {
      id: 'NOTIF-' + Date.now().toString().slice(-6),
      orderId: order.id,
      title,
      message: combinedMessage,
      whatsappUrl,
      smsSent: twilioResult.success,
      createdAt: new Date().toISOString()
    };
    store.saveNotification(localNotif);

    return {
      success: true,
      title,
      message: combinedMessage,
      whatsappUrl,
      twilioResult
    };
  }
};

module.exports = notificationService;
