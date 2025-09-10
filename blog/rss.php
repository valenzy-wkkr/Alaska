<?php
header('Content-Type: application/rss+xml; charset=utf-8');
require_once __DIR__ . '/../includes/blog_functions.php';
$data = blog_get_posts(1,20);
echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
$base = 'http://localhost/Alaska-1/blog';
?>
<rss version="2.0">
<channel>
  <title>Blog Alaska</title>
  <link><?=htmlspecialchars($base)?></link>
  <description>Actualizaciones y consejos sobre bienestar de mascotas.</description>
  <language>es</language>
  <?php foreach($data['posts'] as $p): ?>
  <item>
    <title><![CDATA[<?=$p['title']?>]]></title>
    <link><?=htmlspecialchars($base.'/post.php?slug='.$p['slug'])?></link>
    <guid><?=htmlspecialchars($base.'/post.php?slug='.$p['slug'])?></guid>
    <pubDate><?=date(DATE_RSS, strtotime($p['published_at']))?></pubDate>
    <description><![CDATA[<?=$p['excerpt']?>]]></description>
  </item>
  <?php endforeach; ?>
</channel>
</rss>
