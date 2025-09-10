<?php
// RSS feed basado en la nueva capa de blog
require_once __DIR__ . '/../includes/blog_functions.php';
header('Content-Type: application/rss+xml; charset=utf-8');

$q   = isset($_GET['q'])? trim($_GET['q']) : null;
$cat = isset($_GET['cat'])? trim($_GET['cat']) : null;
$tag = isset($_GET['tag'])? trim($_GET['tag']) : null;
$tags = [];
if(isset($_GET['tag']) && is_array($_GET['tag'])){ foreach($_GET['tag'] as $t){ $t=trim($t); if($t!=='') $tags[]=$t; } }

$data = blog_get_posts(1,20,$q,$cat,$tag,$tags?:null);
$items = $data['posts'];

$siteTitle = 'Alaska Blog';
$siteLink  = (isset($_SERVER['HTTPS'])?'https://':'http://').$_SERVER['HTTP_HOST'];
$selfLink  = htmlspecialchars($siteLink.$_SERVER['REQUEST_URI'],ENT_QUOTES,'UTF-8');
$now = date(DATE_RSS);
echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><?= htmlspecialchars($siteTitle,ENT_QUOTES,'UTF-8') ?></title>
    <link><?= htmlspecialchars($siteLink,ENT_QUOTES,'UTF-8') ?></link>
    <description>Últimas publicaciones</description>
    <language>es</language>
    <lastBuildDate><?= $now ?></lastBuildDate>
    <atom:link href="<?= $selfLink ?>" rel="self" type="application/rss+xml" />
    <?php foreach($items as $it): ?>
      <item>
        <title><?= htmlspecialchars($it['title']??'',ENT_QUOTES,'UTF-8') ?></title>
        <link><?= htmlspecialchars($siteLink.'/blog/post.php?slug='.$it['slug'],ENT_QUOTES,'UTF-8') ?></link>
        <guid isPermaLink="true"><?= htmlspecialchars($siteLink.'/blog/post.php?slug='.$it['slug'],ENT_QUOTES,'UTF-8') ?></guid>
        <pubDate><?= date(DATE_RSS, strtotime($it['published_at'] ?? 'now')) ?></pubDate>
        <description><![CDATA[<?= mb_substr(strip_tags($it['content']),0,300) ?>]]></description>
        <?php if(!empty($it['category'])): ?>
          <category><?= htmlspecialchars($it['category'],ENT_QUOTES,'UTF-8') ?></category>
        <?php endif; ?>
        <?php if(!empty($it['tags'])): foreach(preg_split('/\s*,\s*/',$it['tags']) as $tg): if($tg==='') continue; ?>
          <category><?= htmlspecialchars($tg,ENT_QUOTES,'UTF-8') ?></category>
        <?php endforeach; endif; ?>
      </item>
    <?php endforeach; ?>
  </channel>
</rss>