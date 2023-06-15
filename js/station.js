// js、jQueryを記述する際はここに記載していく

/* map_kadai.html
---------------------------- */

//　０.Firebaseの初期指定　--------------------
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onChildAdded,
  remove,
  onChildRemoved,
  query,
  orderByChild,
  equalTo,
  get,
  child,
  update,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db, "favorites");

//　１.国土地理院APIで行きたい場所の緯度経度を検索する　--------------------
var titles = []; // グローバルスコープでの宣言
var coordinates = []; // グローバルスコープでの宣言
var limitedData = []; // グローバルスコープでの宣言

$("#btn1").on("click", function (event) {
  event.preventDefault();

  var goal = $("#goal").val();
  var geocodingURL =
    "https://msearch.gsi.go.jp/address-search/AddressSearch?q=" +
    encodeURIComponent(goal);

  axios.get(geocodingURL).then(function (res) {
    const goalData = res.data;

    const filteredData = goalData.filter(function (item) {
      const title = item.properties.title;
      return title.includes(goal);
    });

    var limitedData = [];
    var randomIndexes = [];

    while (randomIndexes.length < 5) {
      var randomIndex = Math.floor(Math.random() * filteredData.length);
      if (!randomIndexes.includes(randomIndex)) {
        randomIndexes.push(randomIndex);
        limitedData.push(filteredData[randomIndex]);
      }
    }
    //var limitedData = filteredData.slice(0, 5); // 最大5項目に制限

    var coordinates = limitedData.map(function (item) {
      return item.geometry.coordinates;
    });

    var titles = limitedData.map(function (item) {
      return item.properties.title;
    });

    console.log(titles);
    console.log(coordinates);

    var selectBox = document.getElementById("goal-info");

    selectBox.addEventListener("change", function () {
      var selectedIndex = selectBox.value;
      var selectedCoordinate = coordinates[selectedIndex];

      var x = selectedCoordinate[0];
      var y = selectedCoordinate[1];

      $("#x").val(x);
      $("#y").val(y);
    });

    for (var i = 0; i < titles.length; i++) {
      var option = document.createElement("option");
      option.value = i;
      option.text = titles[i] + " - " + coordinates[i];
      selectBox.appendChild(option);
    }
  });
});

//　２.heartrailsで行きたい場所の緯度経度に基づき最寄駅を検索する　--------------------
var stationsData; // グローバルスコープで宣言

$("#btn2").on("click", function (event) {
  event.preventDefault(); // フォームのデフォルトの送信を防ぐ
  var x = $("#x").val();
  var y = $("#y").val();
  console.log(x);
  var stationURL =
    "http://express.heartrails.com/api/json?method=getStations&x=" +
    x +
    "&y=" +
    y;
  console.log(stationURL);

  axios.get(stationURL).then(function (res) {
    console.log(res);
    console.log(res.data.response.station);
    const stationsData = res.data.response.station;

    var html = "";
    for (let index = 0; index < stationsData.length; index++) {
      html += "<h2>" + stationsData[index].name + "  駅" + "</h2>";
      html +=
        "<p>所在地: " +
        stationsData[index].line +
        "  都道府県:  " +
        stationsData[index].prefecture +
        "  目的地からの距離: " +
        stationsData[index].distance +
        "</p>";
    }
    $("#station-info").html(html);

    //　chatGPTを動かす
    let prompt =
      `日本の` +
      stationsData[0].name +
      `駅の観光名所について40文字で教えてください`;
    console.log(prompt);
    sendPrompt(prompt);
  });
});

//　３.Firebaseにお気に入りの場所を登録する　--------------------
$("#send").on("click", function () {
  // 5択から選択した目的地をHTML文字列をパースして配列に変換
  var selectedIndex = $("#goal-info").prop("selectedIndex");
  console.log(selectedIndex);
  var selectedOption = $("#goal-info option").eq(selectedIndex);
  console.log(selectedOption);
  var htmlString1 = selectedOption.html().trim();
  console.log(htmlString1);

  // 目的地に紐付く最寄駅最大３駅をHTML文字列をパースして配列に変換
  var htmlString2 = $("#station-info").html();

  var stationsArray = [];
  var containerElement2 = $("<div>").html(htmlString2);
  containerElement2.find("h2").each(function (index, element) {
    var stationName = $(element).text().trim();

    var stationDataElement = $(element).next("p");
    var stationDataText = stationDataElement.text().trim();

    // stationDataTextを適切にパースしてline、prefecture、distanceを取得する
    var regex = /所在地: (.*?)  都道府県: (.*?)  目的地からの距離: (.*?)$/;
    var matches = stationDataText.match(regex);
    if (matches && matches.length === 4) {
      var line = matches[1].trim();
      var prefecture = matches[2].trim();
      var distance = matches[3].trim();

      var stationObject = {
        name: stationName,
        line: line,
        prefecture: prefecture,
        distance: distance,
      };

      stationsArray.push(stationObject);
    }
  });

  console.log(stationsArray);

  // Firebaseにデータ登録
  const favorite = {
    goal: htmlString1,
    stationsArray: stationsArray,
  };
  const newPostRef = push(dbRef);
  set(newPostRef, favorite);
});

//　５.chatGPTから回答を取得する　--------------------
async function sendPrompt(prompt = "") {
  let API_KEY = "";

  // promptがない場合
  if (!prompt) return;

  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      // 'model': 'text-curie-001', // 動作テスト用（料金的に）
      prompt: prompt,
      max_tokens: 150, // 出力される文章量の最大値（トークン数） max:4096
      temperature: 1, // 単語のランダム性 min:0.1 max:2.0
      top_p: 1, // 単語のランダム性 min:-2.0 max:2.0
      frequency_penalty: 0.0, // 単語の再利用 min:-2.0 max:2.0
      presence_penalty: 0.6, // 単語の再利用 min:-2.0 max:2.0
      stop: [" Human:", " AI:"], // 途中で生成を停止する単語
    }),
  });

  const gptResponse = await response.json();
  console.log(gptResponse.choices[0].text.trim());
  $("#soudan-response").html(
    `chatGPT先生の回答：` + gptResponse.choices[0].text.trim()
  );
}
