export default function handler(req, res) {
  const { echostr } = req.query;

  // GET 请求 - WeCom URL 验证
  if (req.method === 'GET') {
    console.log('WeCom URL 验证');
    // 返回 echostr 表示验证成功
    res.status(200).send(echostr || 'ok');
    return;
  }

  // POST 请求 - 消息回调
  console.log('收到消息:', req.body);
  res.status(200).send('success');
}
