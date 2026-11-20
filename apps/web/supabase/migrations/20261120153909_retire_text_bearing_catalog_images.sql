-- Reviewed every distinct active bundled asset. Filenames are SHA-256 hashes of the JPEG bytes.
-- Keep the decision independent of catalog IDs so duplicate imports inherit it.
create table private.funny_retired_assets (
  storage_path text primary key,
  reason text not null
);
alter table private.funny_retired_assets enable row level security;
revoke all on private.funny_retired_assets from public, anon, authenticated;

insert into private.funny_retired_assets (storage_path, reason) values
  ('05fa3615f37b644c5a45fd6d46ad3d3a9b86bda392251d3656dc3aef4851f07e.jpg', 'words'),
  ('09d8b8e2c41eec629700d75444baa4030237ee3afcf52b1f5017e79205243a13.jpg', 'words'),
  ('0a6f92b8c56f907c9b3691c21294b1ee34870d8bb27c205324a42102fe4c3c30.jpg', 'words'),
  ('0a9993eda4ae178a7a3190e21eb21ff89a112909c51920594354fad242ce8a7a.jpg', 'words'),
  ('0b69ef7e7c4713f84b2bf7f9068d70a6b94bc01f1a18852144f4408c8ced89d0.jpg', 'words'),
  ('0f9a228bae280708201e27162ed8f538ced83c993f6be6317c8f9b676b177f9d.jpg', 'words'),
  ('1316ad952fd9e56d26130363f341f1be7cbbc5552f6aa2d9729a855303d99276.jpg', 'words'),
  ('14528d9ea4677a60e27072221c2ba49554199c93517b35bbdc8202f074c30c4d.jpg', 'words'),
  ('14cc65571a76a26840bd188477aa098d15d1e7e49a9d6f6371960f0ceb6465ad.jpg', 'words'),
  ('14e60ec55ff222790dfc4689fee2fd0c20835df047230c7dde89542ff46ebf09.jpg', 'words'),
  ('176d4700a90ca02a160cc335871e5c4cc9d9ef91984cef31b0c5414902382560.jpg', 'words'),
  ('1a1d765ad4a71ed1fcb6ef78ba941ca684e5715ae23b8e86b1ecd06347a74a3e.jpg', 'words'),
  ('1c2280b03578f7740902a46ef2a69fa0153e61ce8ba7e9050f6e43787860440b.jpg', 'words'),
  ('1cc0be1030cf64e321f621fe683e61edfe09e09282f53126299f0ec309d66a83.jpg', 'words'),
  ('1e6ed74eab0c3e3903fc9e3207a35ca16493d30729679afc58d496f7e83d4a1f.jpg', 'words'),
  ('2188d85b8dab94bb77f5c74040d8cf7490b92b92b0061578a962869d76eba689.jpg', 'words'),
  ('228ce9d7ddc9e28c1640059d2e64997744cefc21336e033984319860f0ce1be2.jpg', 'words'),
  ('2453e59776f373d8f4becb434b06d27452cc5d584a9a73d465e9deeecb6cb778.jpg', 'words'),
  ('271776eeed4403fdf5f65ead5d1b4e617e398efa96ea0dab6fe0fdf85b4390cb.jpg', 'words'),
  ('2a253e7bab95638bfb19269017566c9013474091088de19f04b760bff87bfce2.jpg', 'words'),
  ('2ddd58be5db26e9f786bb83bf628a26bb77e0eb713ae1bd0af470c9b7057207b.jpg', 'words'),
  ('2edb89484c8df80f60e6bd553b64378994ce510772a0ad7c79665849df42f6b2.jpg', 'words'),
  ('2f47cedd6e306e7c19129669b7c2762f85b2e41899ab30d324ac30f154ba7ef2.jpg', 'words'),
  ('3028c55e89052cb4651d51596af0290be1d2d6e24556edfc49dbb2613a912f52.jpg', 'words'),
  ('3153af30d5b0bee11c4483b73c0073f395855183a0d632aed7c187fe260a600e.jpg', 'words'),
  ('31d4703fe0a189206514dd0315b14d4c4c3690b85ba66b07f21c5c59dc68cffd.jpg', 'words'),
  ('32a96d3fdacd3d2dabb642428dec0370067452ea103556d6b88b6afae1b448fc.jpg', 'words'),
  ('32ad997540265d1ffc6f0fdee6fcc4351c58c92a3df8180b8ddbf5624ae3f29e.jpg', 'words'),
  ('3712a60e3f4389193f056be3d454ddb2c2a57fa9c63e55e6812cb8a9c5970d21.jpg', 'words'),
  ('3759673b6fba7ac39b3f1ad24690e13fcc2a027adb2e6e2af9a4a15cce3d2906.jpg', 'words'),
  ('3aa6629e4bff6ac8416da3015d2f395d244403b1ed325c21dd0a09a54a286068.jpg', 'words'),
  ('3aa9ead6c44b85b5ce558161ae4b0e83d2289e539c2492532fed3bf7233d1228.jpg', 'words'),
  ('3b15eedca24bc343cdb3b626483c85e31c7c1e5d958eec5048727954e9e5cdf9.jpg', 'words'),
  ('3b2d0e82463b411584485fa0ecabfb59f6d5803412303a9a033bb3f9a91f9914.jpg', 'words'),
  ('3eab77ad08ce49cb3b490d3ea52c808af75fbd89601669ed2d7c07db10e972a9.jpg', 'words'),
  ('40f953e7563c48850af1e451e89008e76d41320dee0256f0e86a72fa6170a18b.jpg', 'words'),
  ('4233b244b8b39db6d8a0794dfd3cc7d703d49d3d6602539a78ab16af7fb1f00c.jpg', 'words'),
  ('4322e788041f840b7798a32df6f65881b3d8671eaaeb7b9e4ca4548f7bf785f9.jpg', 'words'),
  ('43270a73df34fe29776dd25eebda70dc2af06eacf1da9088d0ca817c779988e1.jpg', 'words'),
  ('439ced9d1cefc3f48907e9bc7388aa7dc04be6b332dabb7214ae9efdc255decb.jpg', 'words'),
  ('43df150b6f231c6bb4d52bae6786cc3c347b0f9d903f7c94464e6b67eb976aad.jpg', 'words'),
  ('466360203b0478f63b9bdfd0c92e376be0546d1ff08a186340968c08cbfd590d.jpg', 'words'),
  ('47ae6c6fa07c8c123ad3ef8c25dac0f0b6a2e43022ae54d84eb12b3778cda263.jpg', 'words'),
  ('489716bf9fcadc4857bdc9e3de839a3013f8bb82b53fa549d725a36126e1db4f.jpg', 'words'),
  ('4938c73181bf006b737826e3cb4b98094e7c0a4be6fee190a05e4b1b034e51ac.jpg', 'words'),
  ('4a86463b36e628f4c4d959914659fed9cc97dc46fe40ea2262eff4889afc368c.jpg', 'words'),
  ('4aa3cfded7f81f7b82c47566c8158904b73f0aca53a1863d15c7b2d1454d5a0a.jpg', 'words'),
  ('4bef10b0c73ef461e8e3f623214aab7d8439122ddc151e3c1617628a2e4fba14.jpg', 'words'),
  ('4d2165940ff968dbab208f66e9ea664f41b900f8998f3b3704e4372bf8e4205f.jpg', 'words'),
  ('4ead82cceed55a9506da6e9230f9e51aaa54a5397b9834d5bf7319467d86cd79.jpg', 'words'),
  ('4fce94aef2995f50b1d0848b51add933b47f1e1650a0c7e689a6989e46afbcc7.jpg', 'words'),
  ('5054da50679726bf92ad57702c7177b1d1ec57658d3aebf2b67a737f8c67b0e2.jpg', 'words'),
  ('51185ae784f2d3b4c42b6dfae352b478dbfb3b256ef6aca3a3e991c44e7a3a1a.jpg', 'words'),
  ('523267cabda6693602b83e53d33c3798315dd332939768e4e02e2f0f255986f3.jpg', 'words'),
  ('53a14d5a6e4bdca6d43fd930830e3068caf56adb15152fa570406d704fc8fb29.jpg', 'words'),
  ('55c72a6f24e7c6a6cf58421144a04365870d4e46cfdd0066587ce249e7176abf.jpg', 'words'),
  ('5823624d9c105a224c1656e47749b2250746a74a7b2c27bb76102a8ee969ba8d.jpg', 'words'),
  ('5b5749e0155b56b56d4e16a7c2afccad298b723e701196b6946b0229cae3c3c9.jpg', 'words'),
  ('5ce2f698ddb3908c7097a0cc0216daf8bc1000a12c48f1ceeaa1d995372184b1.jpg', 'words'),
  ('5d2bd526e33947b378a6e8aede7dd5a565928a39f35febcc73e476f1d0e41dc3.jpg', 'words'),
  ('5d8da1f0ba6c3d424828fb42badacc28fd4412b0bc14ee0512993657bae53d68.jpg', 'words'),
  ('5f8c798cc613d255c91485972e8004a83d3448ce1075b340b64cfc894eb06a5b.jpg', 'words'),
  ('5fb819276f8c579b2a83edfe716f64010103135cdfde382d8454fc0366f80334.jpg', 'words'),
  ('62bab3ee149db6a1ddb9ab9f1aa7d5bbc0933bea6c8db6b0a389b9bcf0a97fcf.jpg', 'words'),
  ('64e7032a31d95a1e9e9292dc9f274d19b6446c2d196df58b895b46cd9b8282ba.jpg', 'words'),
  ('65df40bfe1b8f30efa59240935cea6d2d39595867de79c15a9edf46396be27a9.jpg', 'words'),
  ('6602b21a0150ff39bdbbd65a32bd3cdfc41509e8b08b8e31497218dbdf7d0b0c.jpg', 'words'),
  ('669661ce712d0ecb63c727fd8e530c5c6720bd2e5dab1f2afd70f9d02415e0bd.jpg', 'words'),
  ('66dee289334f2abb914613f3f56ed18694f4670a9eec2c9da2e48c1e3a1fd8f2.jpg', 'words'),
  ('69030e26eae21742bc141bd6745995c1670b70cc5dbc65c6a66e2993b6652693.jpg', 'words'),
  ('69eed024525b26c4457dbba381a4cd840c36e51e57f8794d9d73610b1ab8b740.jpg', 'words'),
  ('6aba8c52da30106236cd448fdcaa7c66d7f4ae8cbb1f6f3bdf9514999e35f540.jpg', 'words'),
  ('6d119e9de0510518329215a5b002f0c6799c83c9fde6c12e3013bea9c10a8913.jpg', 'words'),
  ('6d1efd553fdaf249cd2291dc2ffb7c9713c15621b8744385e77dfb51e150f9b6.jpg', 'words'),
  ('6d9750d08fcb5e1a69e89233f8b046f0105811fa7e6da3518e85bf67e3763f99.jpg', 'words'),
  ('6f4b80f6826103425e24e94322ebeb7d541ee068ab16a1e6247a2b2faed933ff.jpg', 'words'),
  ('704c684f8fa49edd81cf5a8e316cb845032525ec3413be0e3a9b46c93dd3675d.jpg', 'words'),
  ('73937af4cfe60c812e1316533acc45938108892593447a4b8f49ccbb2da530a7.jpg', 'words'),
  ('7548cd5cf33a3773cd7ac92894480697723a1f2ef6f2541f22ebb43bb347e181.jpg', 'words'),
  ('76fb62424a4f2e566366ed46d2d9ab9c100c9ca1756de43bc222d5bd6fc37ee2.jpg', 'words'),
  ('7adcea437f66b4aff2ea8a3402db7c8e4755749cfdd0b98fdb31adb54a6ae1e3.jpg', 'words'),
  ('7af753068aaae776b9b14eeff3f63a4a3a09ad0bb5db4f4d17af8c577c6abe98.jpg', 'words'),
  ('7e46122ca1344c24a4d22c1ef23d318f7245602c59e320ab48720e6bfd434d14.jpg', 'words'),
  ('7f3f4983fbbfd6801ddc8f71cfb7a2d9673a7669968c2ceb76403b08afe50072.jpg', 'words'),
  ('83f9fb9de8d2129ca877c298e52cf82f2c828d85bcf2a089eb87f70a5e78fd4d.jpg', 'words'),
  ('84408fed1ef9690326145649ae3809d5d720dfdea1b84569ca0364d826746ecb.jpg', 'words'),
  ('8462398c33a7f4cf0947b00bdee17feac37e328dc7c5c68cd84d273fe0df8c81.jpg', 'words'),
  ('85a92111e1fd717a50ad1c00bde86d45f191f1f4749076ccb32e59816cacd8d5.jpg', 'words'),
  ('874167ce54f46bb8fc1e6143b7af195c22b6606ce9f86328f656630f38857968.jpg', 'words'),
  ('88d0c97df09e878d24c382ad8121dd777cca9df8029a56b5c046e90784c49773.jpg', 'words'),
  ('8a342eb848f6555a418fb9767ec53dfe9e3e3772d218709251be24dec5774336.jpg', 'words'),
  ('8a81b1b83e4968deff46c3502a364ac3c9aa7848ccdedc8e57db424c457950b6.jpg', 'words'),
  ('8d0a13d952c53481449c835ce709ec891843e1d089a53220c718c0a675db8949.jpg', 'words'),
  ('8db02697027a1384f687afa528b3e2e21e0f84cada50f6adc1a39bd4188c9144.jpg', 'words'),
  ('903b9662e54eff0072d2e43bf771340d7edee95b42c500cfb259ed425046062e.jpg', 'words'),
  ('93055c1c2c5ae579542216ec1651a105b3060837bdffe1d182761adb3098b166.jpg', 'words'),
  ('95860c072585b61b621fa8393e58a21a0c7edddf290be3d2740f7c25c0482d2f.jpg', 'words'),
  ('9a2cde7a8ab86a01b43c049067c2f0094c09b4f424d92c00b4c2da70e4fb8c97.jpg', 'words'),
  ('9a7df400f7d10c83f3ec4d4e0d858ea01dd1e8c75c133b352d9ab7c41de8c940.jpg', 'words'),
  ('9b3102a821c04e935cb77123707cb9c31f4364dd0c90dfef0abfe67d35545d46.jpg', 'words'),
  ('9ba4be801fa74f22f35677032319c2b1dfce6ef32fe708813e13c88a7c527c78.jpg', 'words'),
  ('9d0f66e253f9b183f0c409aa1fc00f736a43e2af6a6c2144345d7630af869ee6.jpg', 'words'),
  ('9e6bac84a8fd87462e599d28793ef5c3776e8ed6dbd84b67db418facaa094bc6.jpg', 'words'),
  ('9f55453cdc25160d49e5f27ad0c13fd40a3737c7c5c635555d8dd1d0a096f127.jpg', 'words'),
  ('9fa3191a0024592938c36306254f955ddd6b21e3700452d9840a9aae05a84ec4.jpg', 'words'),
  ('a0a9c180f2a580322c26b62b1681cbd0a88bb394d2eaf30cc21fbd8b4de4c883.jpg', 'words'),
  ('a1143dea7290297218db32e26928a5210a95867965a6f7a1ac5e1d096ebc8c2d.jpg', 'words'),
  ('a207ad9d286fe04600bf22a8668cb5c06ba673ae895ef0ea31cc78971c613cff.jpg', 'words'),
  ('a37b3e225aa6cba96a0fba9d74ce72c86d7cec3f62a725e582ec14e572843a61.jpg', 'words'),
  ('ac7ea65f9c68fa7541cc837e53f950ea65d98cd9d48f676c3fc86cd5a9411099.jpg', 'words'),
  ('ad7a41b0a6feac9d55ca94a36889832fd559c709bf2d9ec9288c52037cf15fe5.jpg', 'words'),
  ('af6cc8ce76da9c07290293d860bd422969acc5211f6dfa7df30ba0336591f00a.jpg', 'words'),
  ('b17426c72a2337696fcc417d8be05a9cb4e29c9da98b4a3651d8cbd8ea716be6.jpg', 'words'),
  ('b39a826fc082dc89281418a08541640232972e64ff5326e68c6743c33ad1b0ce.jpg', 'words'),
  ('b8cd1147d195bc59a89a023475d9532a49e2f3f98714b528a44ad8ec548d301a.jpg', 'words'),
  ('ba3f3155b2b700ef6136bcd397d9706167ebecd0a073b554687b69336377f7ab.jpg', 'words'),
  ('baa25d8d52edc651a11fe58e9be1ef309b8c58cbc6455322f8ee30c058155456.jpg', 'words'),
  ('bbdc39eaf6c9c8707255025906a43cdfa533443c2d0f30b67d205c9bb80786a4.jpg', 'words'),
  ('bbe1b5315ec1a8ec6a2a3ac8fc20f7f687ed5933ad067b47168a2d70770c40b2.jpg', 'words'),
  ('be189a368a0d2af9207a3ad53b6ae237d12b77e6465ad72d8428b237d7b01daf.jpg', 'words'),
  ('bf7229de0d626ae233bc5df5cb5e5604236c93353b66fbd8cdc84fb539defcff.jpg', 'words'),
  ('c2218cfebc8cb4b65525b8d30aa116109ea707c325e32a44335e639c179001db.jpg', 'words'),
  ('c27d59037cecdec3e1aa499dca49bc74ff7aad482035659315ca5f5c0ddaf654.jpg', 'words'),
  ('c2e2f69a987252dea1ccd2781daa11e902762c13f40d68ce4a1c3965bedf0495.jpg', 'words'),
  ('c38dc56c230fa3c4822dac7fb1ff63ba0dcb56e18db0b0d177af7fb8e6f80714.jpg', 'words'),
  ('c38f550b58f526bb161fde9c9562d09036ec4e7fc02a52cd3d4d9171ed1b27ef.jpg', 'words'),
  ('c39854b4466dcccd0e5a26cc240f2ace92bf3ed56fae424e0cae7ba10b1ddd64.jpg', 'words'),
  ('c4e3e933e42a5fa72851f21599e458771a2cbbf135b4631d1d8a0096479824ee.jpg', 'words'),
  ('c99d6cd1cf44641f3f672abe2f8d64cc83427aa51f305d56e461dcecc575ede2.jpg', 'words'),
  ('cb65e271252ec34218f569def14753701f5262ca436d516c01ea61802118ed30.jpg', 'words'),
  ('cbff6e1e444a3457aa0b5c57b34a78be4283f71d1b705418a3df6801d9545abb.jpg', 'words'),
  ('cce1675c7ffc9526747a8625a877c9bada7d25825bb5c87668249b81ca3aa03e.jpg', 'words'),
  ('cde0cde939c48b87714fe2ca91b230a6815878fca83ebff6b46c71f560736ff5.jpg', 'words'),
  ('cf30328ead92107b5e26c9df6b0717cc071ca4e216ad00645d638e6fc4d0f076.jpg', 'words'),
  ('cf346a4ffd4db296d7bf0766824c1d2dbe72cb56c9f3566cd2782728dd1e85ad.jpg', 'words'),
  ('d029ef1481823eec143dd66e2cec27ad2a51b8a06b6909c4412b795476a156e6.jpg', 'words'),
  ('d49a45fc539d6c9f14d439f47c92f2362ba9f2716bbb2fc8f782be882d43b6db.jpg', 'words'),
  ('d538305b6bc85a2eb7c975d818c8a6233790c32868617b519fa1bdc7142a0870.jpg', 'words'),
  ('d546837ec8c387635d2ea04cb909d82db8452d9bc9d7fd80ee33157fbf161771.jpg', 'words'),
  ('db9daf6b73753f8a90a280ccc18b2aae5f562371eb9ebb7875fb16eb9849ff72.jpg', 'words'),
  ('dc2c753dad535dca625c36eff470770377be623cee02084155cd2f3674dcf63a.jpg', 'words'),
  ('dd058749dd3faf81367717cc7a78940e7c871bb27e3728cb35a1492f60adf125.jpg', 'words'),
  ('de616325296322a6a3d0c51334061d0957c79fd87441ae38a4a2a17254a3f9a9.jpg', 'words'),
  ('debce843f253c264836c492e1bc5e68227f1346bd84ff3c9a1a6410a75707513.jpg', 'words'),
  ('df5590129e18a896ebfa7f4d134995f780403d9d567d7b7420519ec946ac817e.jpg', 'words'),
  ('e125fbef3dacfbf3147727f7659e83d13081b7b396b1fe0d9245fa031f2790cc.jpg', 'words'),
  ('e1fb22dbeae32169203f11eaf0de294fb242ffb6bdfb1169bf79a944c4c6feb5.jpg', 'words'),
  ('e2feafe9241936a758d01a5e1b8d6a9542397ac81e86ce76d72e0653d1af3cac.jpg', 'words'),
  ('e5939002bd677ee46d8099d832f659ffcc24733cf4a90ec4a085a7aac7f659ed.jpg', 'words'),
  ('e874cc32e863a737fdbcd1ba64b66f0305b4880ed9ae2c0da1ab4e76b8ffd55b.jpg', 'words'),
  ('e88601f065d7abc9c4f47d78772bbeabeac15d8ea4f3eb25c5123f1db7f5ed4d.jpg', 'words'),
  ('e8f57e63277235d841d76c3e07f951d7082b0397f540e4c9b2b91f89c70d639f.jpg', 'words'),
  ('ed93fd1c65cef7d29be4790da6d2161ce8455f1617abd6b37b160b451abd4a50.jpg', 'words'),
  ('f087d29fdba06030c2a30f7eb70851884368cb6817e9d8d3f4b303136636776a.jpg', 'words'),
  ('f0d7c686c8275128d92e5d5e2d4842274324a3c125331c5e79ac354850df2651.jpg', 'words'),
  ('f1247c28f05ae4145c7d1b06252b6f86b8b3bf658b24c71d1f4446574c27a0a5.jpg', 'words'),
  ('f3d8b069509a678157d3f2bc6b0854d255ab5bf5f778665d1d0d6370519e0330.jpg', 'words'),
  ('f433aaf430aec5bda887f5f297c07d7fba8f573fbed59e7a3bf5535552ec5d49.jpg', 'words'),
  ('f74a1cffd284bcc36254b9ed41156a0bda5a12acd047d2f4ab2feb78db6e89f2.jpg', 'words'),
  ('fa1349fb62844bb1941339e9833fc06acf28e52a6f415fed3ad0991d35644288.jpg', 'words'),
  ('fae96bbf57668fa8b466619ab71621ff73e85f7f5bb512bede242d40576df4d8.jpg', 'words'),
  ('fb1596f0f8dba4d7322ecf1666e0c1438d3be62c7f3331e3249fc7db7c8c3320.jpg', 'words'),
  ('fdc333bfa6e025ba6bf8796a3ad16159610d68074a12b9397c8156bd593974cb.jpg', 'words'),
  ('ff64b29de2e9ae2f223311baea0887f5678c1d97f6dc7eac15aaaa2a042d806c.jpg', 'words'),
  ('ff7666e67f24f88e149c67fb277a5d9818ed7b38d4d73772a4ff27ad329deeb2.jpg', 'words'),
  ('06460b1d5c14074c939029fcdc2c64c06e31fb38e8493a9e6ab9cc7a3420ea26.jpg', 'possible lettering'),
  ('0eb5c1a5a4003d4878ace7f78ecc774164b91a5d6fe3b46f2fc7cad0d5f717b6.jpg', 'possible lettering'),
  ('15bdf174fc153b7bf9144458a09731fe40f6825acfcf33e63c87eeaea821db1f.jpg', 'possible lettering'),
  ('46ad9921e5b6f0087c71e8d4e32471efb4ae0abda7ae3329394f3fbb8600ad75.jpg', 'possible lettering'),
  ('4b997ab4e6d2fc362ad29dccb477abec59473c704aa946d27effe9eb5b1a8234.jpg', 'possible lettering'),
  ('4f1a5fad2742053f364430777763a3920a14c4c8192264785c2369f7bc7ab508.jpg', 'possible lettering'),
  ('5089516be0ae1e932d166b9273cafd73b40097483f3b77756759515218a05c68.jpg', 'possible lettering'),
  ('65c156f631f0993a2a4fa4a9876c1fecb963334ad412bf87952df26bcfb136a3.jpg', 'possible lettering'),
  ('6650e3d0fa37417574ee17eb1f86e8b03bd8335ca583d6ca03094450c5aaa8ca.jpg', 'possible lettering'),
  ('6eaa19a405d8eed9f17692b3454c2160465a1ecc74b1b9b7170ce3fdd6cc23ea.jpg', 'possible lettering'),
  ('72a4521d1a812d1c30a6fb59c909858415329885dc00050e989493b028da5b05.jpg', 'possible lettering'),
  ('7c07417be7b428e495f3ca95ab5587870e31f8920aac60be678de1dc1422bf15.jpg', 'possible lettering'),
  ('7f8ecb88151b0b3964212a33f154a0a821a714989b7f2ee90c0ae3e2ad2153b9.jpg', 'possible lettering'),
  ('896a93f953aae2549af3a290366381ffe6a4dd5d6c8772851bae89dfc53bc118.jpg', 'possible lettering'),
  ('9c95f122a0778739fe508baf65c45e029378a350c512eb25287ae979609c02d7.jpg', 'possible lettering'),
  ('a7f10d0ecc192b1c3fff4851206c7f6ae615df2d49e732d3cc5cfb1cc820dbe4.jpg', 'possible lettering'),
  ('ad835d60d73bb528c174df8bd3daa84f9a2aecfbce1a9a9981335f0a589143c3.jpg', 'possible lettering'),
  ('b7bbf0af54cc424bf7923e77905599f57c80cbee585a1b9df583ae242370f75d.jpg', 'possible lettering'),
  ('ccdee285b27ac0b9b4c7ead958ac2d33b3877eff5e08a5ae830e7385268f754b.jpg', 'possible lettering'),
  ('cdbcd538911e78f2d0772ac304631e4fe228f1e26b0afb9bda22ba45fee5bb34.jpg', 'possible lettering'),
  ('cdcfd6864b05774482280330d11ad71ab81001b022df870426b55863a467c492.jpg', 'possible lettering'),
  ('df7f07992e7eaab39276a4432718ff72491709592e841980af5c8b812fd636e0.jpg', 'possible lettering'),
  ('e43a155d11e20d9d99f68cab4171f9fa8d0ca8a30c429d578f7f179f0303d050.jpg', 'possible lettering'),
  ('eb7d2134a2eed22ebeefacef91e11ecb0b078753e5a7cf978c64ff84087bc46c.jpg', 'possible lettering'),
  ('ecad0031e9a519179d75ad2c3a45fa695a3ac026d57668bb062dea60cfab85ec.jpg', 'possible lettering'),
  ('f77ed7751cc39a2264572e09760d9a3f89db1651bab2fec0798bff94aee72214.jpg', 'possible lettering'),
  ('09356c275374ac4051835737de34b3160660307145c6284132747440969f155b.jpg', 'numeric or punctuation overlay'),
  ('124b64d01c94929933bdae33ec910e5024324601aba83b4ca016a7db7f1558e1.jpg', 'numeric or punctuation overlay'),
  ('12c638d29f751b3b1d2766e86fca1d07916cbfe2a1b6ff81b626ba2ff655a355.jpg', 'numeric or punctuation overlay'),
  ('5a7fe60ad03556cdbd4a72f38407fa89b23c2d8d3221674bf9b09e32f38ad34b.jpg', 'numeric or punctuation overlay'),
  ('6484cf59eaf927e838ec5f1163ed7e2e696e6c2d94ba4a27f47be29ffa87ab6f.jpg', 'numeric or punctuation overlay'),
  ('70ded7f09a50c1a08988b73ac73d23f7a9169b141d7f8c8665f3fdbf7bc55f5b.jpg', 'numeric or punctuation overlay'),
  ('9006010238357d6f945640f0149bc82686eb8c6cf603d60167d8b270fac3bd34.jpg', 'numeric or punctuation overlay'),
  ('abcabdebb5836358b39a64efc6c76637cccb064062530c507c5615b6e7df6dac.jpg', 'numeric or punctuation overlay'),
  ('b1fb5048e02f55f18409b8c61e937baa8f1d2eed02b86ca9aec05bc39bc07512.jpg', 'numeric or punctuation overlay'),
  ('b924469ffb173c26e85e8599e9376b4cae72c4ecd061e67931da708fca13da41.jpg', 'numeric or punctuation overlay'),
  ('d9c07b0c096fbb6a20f41083068f9daf82538aa88570aa1953d8e387a00ad07a.jpg', 'numeric or punctuation overlay'),
  ('95488eba363914cab8873ab968c599232438ae5779f2d1d50b5e8ee50bdc3bc6.jpg', 'unusable 6x2 image');

create function private.funny_enforce_catalog_retirement()
returns trigger language plpgsql set search_path = '' as $$
begin
  if exists (select 1 from private.funny_retired_assets where storage_path in (new.storage_path, new.family || '.jpg')) then
    new.available := false;
  end if;
  return new;
end;
$$;
revoke all on function private.funny_enforce_catalog_retirement() from public, anon, authenticated;

create trigger funny_keep_retired_out_of_search
before insert or update of available, storage_path, family on public.cowriter_catalog
for each row when (new.available) execute function private.funny_enforce_catalog_retirement();

-- Gallery copies retain the source in the exact draft revision that was published.
create function private.funny_post_source(p private.funny_posts)
returns text language sql stable set search_path = '' as $$
  select case when p.bucket = 'catalog' then p.image_path else (
    with snapshot as (
      select state from private.cowriter_sessions where id = p.session_id and revision = p.revision
      union all
      select state from private.cowriter_revisions where session_id = p.session_id and revision = p.revision
    )
    select coalesce(nullif(candidate->>'family', '') || '.jpg', candidate->>'storage_path') from snapshot
    cross join lateral jsonb_array_elements(state->'options') opt
    cross join lateral jsonb_array_elements(state->'pool') candidate
    where opt->>'id' = p.option_id::text and candidate->>'id' = opt->>'image_id'
    limit 1
  ) end;
$$;
revoke all on function private.funny_post_source(private.funny_posts) from public, anon, authenticated;

create function private.funny_enforce_post_retirement()
returns trigger language plpgsql set search_path = '' as $$
begin
  if exists (select 1 from private.funny_retired_assets where storage_path = private.funny_post_source(new)) then
    raise exception 'Choose another image before sharing. This library image was retired.' using errcode='40001';
  end if;
  return new;
end;
$$;
revoke all on function private.funny_enforce_post_retirement() from public, anon, authenticated;

create trigger funny_keep_retired_out_of_gallery
before insert or update of status, bucket, image_path, session_id, revision, option_id on private.funny_posts
for each row when (new.status = 'published') execute function private.funny_enforce_post_retirement();

update public.cowriter_catalog c
set available = false, updated_at = now()
from private.funny_retired_assets a
where c.available and c.storage_path = a.storage_path;

update private.funny_posts p
set removed_from = p.status, status = 'removed', featured = false,
    removed_reason = 'Source image retired during catalog text review.', updated_at = now()
from private.funny_retired_assets a
where p.status = 'published' and private.funny_post_source(p) = a.storage_path;
