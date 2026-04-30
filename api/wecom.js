/**
 * Vercel API - 企业微信回调接收
 * 接收 WeCom 消息并转发给 Agent 处理
 */

const crypto = require('crypto');

export default async function handler(req, res) {
  // 只处理 POST 请求
  if (req.method !== 'POST') {
    return res.status(200).send('ok');
  }

  try {
    const { msg_signature, timestamp, nonce, echostr, encrypt_type } = req.query;
    const body = req.body;

    console.log('收到 WeCom 回调:', { msg_signature, timestamp, nonce });

    // 如果是加密模式
    if (encrypt_type === 'aes') {
      // 解密消息
      // 这里需要配置 EncodingAESKey
      console.log('加密模式消息:', body);
    } else {
      // 明文模式
      console.log('明文消息:', body);
    }

    // TODO: 转发给 Agent 处理
    // await forwardToAgent(body);

    // 回复 success 表示已接收
    res.status(200).send('success');

  } catch (error) {
    console.error('处理回调失败:', error);
    res.status(500).send('error');
  }
}
