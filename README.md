# 課題5　　最寄駅あるかな？　（api）
![スクリーンショット 2023-06-16 2 07 51](https://github.com/yuufujita/api/assets/132199877/52449264-8697-4369-af90-425dc630cc4c)

## ①課題内容（どんな作品か）
- 行きたいと思った場所の最寄駅探索と周辺情報収集ができます。気に入った場所はFirebaseに登録しておけます。

## ②工夫した点・こだわった点
- 国土交通省API、HeartRailsAPI、openAIAPIの3つのAPIを使っている点です。
- 行きたい場所を送信すると、国土交通省APIにより緯度経度が取得され、取得した緯度経度に基づきHeartRailsAPIにより最寄駅が取得され、openAIAPIにより周辺情報が取得されます。
- CORSが理解できず、場所名検索が強いGeocordingAPIが使えなかったので、国土交通省APIに対して入力内容が部分一致した住所を抽出する条件を入れることで、自分がやりたいことに近づけました。
- ブラウザ表示内容を、オブジェクトにした上で、Firebaseに登録できるようにしました。国土交通省APIとHeartRailsAPIの抽出結果をひとまとまりに格納できます。

## ③難しかった点・次回トライしたいこと(又は機能)
- CORSは理解不可、Node.jsは消化不良の状況なので、引き続き手を動かしながら学んでいきます。
- php習ったら、GeocordingAPIに再チャレンジします。
- 時間の関係上、CSSにまで着手できませんでした…。

## ④質問・疑問・感想、シェアしたいこと等なんでも
- [感想] 道は極めて長い…。
