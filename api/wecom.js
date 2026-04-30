import crypto from 'crypto';

// 企业微信配置 - 需要填入您设置的 Token 和 EncodingAESKey
const WECOM_TOKEN = 'MySecretToken123';  // 在企业微信后台设置的 Token
const WECOM_ENCODING_AES_KEY = 'zxojmvZyuTWNqTnpMFEF2DCAWlYVhQLISdp9OlZsUqc';  // 在企业微信后台设置的 EncodingAESKey

// 解密函数
function decrypt(encryptStr, encodingAesKey) {
  const aesKey = Buffer.from(encodingAesKey + '=', 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, aesKey.slice(0, 16));
  let decrypted = decipher.update(encryptStr, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  // 去掉随机 16 字节 + msg_len(4字节) + msg + corpId
  const msgLen = decrypted.readUInt32BE(16);
  const msg = decrypted.slice(20, 20 + msgLen).toString('utf8');
  return msg;
}

// 验证签名
function verifySignature(token, timestamp, nonce, encryptStr, signature) {
  // 按字典序排序后拼接
  const arr = [token, timestamp, nonce, encryptStr];
  const str = arr.join('');
  console.log('签名字符串:', str);
  const sha1 = crypto.createHash('sha1').update(str).digest('hex');
  console.log('计算签名:', sha1);
  console.log('传入签名:', signature);
  return sha1 === signature;
}

export default function handler(req, res) {
  const { msg_signature, timestamp, nonce, echostr } = req.query;

  // GET 请求 - WeCom URL 验证
  if (req.method === 'GET') {
    console.log('WeCom URL 验证');
    console.log('签名:', msg_signature);
    console.log('时间戳:', timestamp);
    console.log('随机数:', nonce);
    console.log('加密字符串:', echostr);

    if (!WECOM_TOKEN || !WECOM_ENCODING_AES_KEY) {
      // 如果没有配置，使用简化验证（仅返回 echostr）
      console.log('警告: 未配置 Token 和 AESKey，使用简化验证');
      res.status(200).send(echostr);
      return;
    }

    try {
      // 验证签名
      const isValid = verifySignature(WECOM_TOKEN, timestamp, nonce, echostr, msg_signature);
      if (!isValid) {
        console.log('签名验证失败');
        res.status(403).send('signature verification failed');
        return;
      }

      // 解密 echostr
      const decrypted = decrypt(echostr, WECOM_ENCODING_AES_KEY);
      console.log('解密后:', decrypted);

      // 返回明文
      res.status(200).send(decrypted);
    } catch (e) {
      console.error('验证失败:', e.message);
      res.status(500).send('decryption failed');
    }
    return;
  }

  // POST 请求 - 消息回调
  console.log('收到消息:', req.body);
  res.status(200).send('success');
}