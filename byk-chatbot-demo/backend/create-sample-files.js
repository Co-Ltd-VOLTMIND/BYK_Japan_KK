const fs = require('fs').promises;
const path = require('path');

// サンプルファイルを作成
async function createSampleFiles() {
  const sampleDir = path.join(__dirname, 'sample-files');
  
  try {
    // ディレクトリ作成
    await fs.mkdir(sampleDir, { recursive: true });
    
    // サンプルテキストファイル作成（テスト用）
    const sampleFiles = [
      {
        filename: '海外出張旅費規定_sample.txt',
        content: `海外出張旅費規定

1. 総則
本規定は、社員の海外出張に関する旅費の取扱いについて定めるものである。

2. 適用範囲
本規定は、業務命令により海外出張を行う全社員に適用する。

3. 旅費の種類
(1) 交通費：航空運賃、鉄道運賃、バス運賃等
(2) 宿泊費：ホテル等の宿泊料金
(3) 日当：出張中の食事代、その他諸経費

4. 精算方法
出張終了後、2週間以内に所定の様式により精算を行うこと。
領収書は必ず原本を添付すること。

5. 時差がある場合の日当計算
現地時間を基準として日数を計算する。
機内泊の場合は0.5日として計算する。`
      },
      {
        filename: '分析装置操作マニュアル_sample.txt',
        content: `分析装置操作マニュアル

装置名：XXX分析装置
型番：ABC-123

1. 電源の入れ方
(1) 主電源スイッチがOFFになっていることを確認
(2) 電源コードが正しく接続されていることを確認
(3) 主電源スイッチをONにする
(4) 起動画面が表示されるまで約3分待つ

2. 安全注意事項
- 必ず保護メガネを着用すること
- 高電圧部分には絶対に触れないこと
- 異常音や異臭がした場合は直ちに電源を切ること

3. 基本操作
(1) メインメニューから「測定」を選択
(2) サンプルをセット
(3) 測定条件を設定
(4) 「開始」ボタンを押す`
      },
      {
        filename: '人事制度ハンドブック_sample.txt',
        content: `人事制度ハンドブック

1. 有給休暇について
年次有給休暇は、入社6ヶ月経過後に10日付与される。
以降、勤続年数に応じて付与日数が増加する。

2. 有給申請の手続き
(1) 申請期限：取得希望日の1週間前まで
(2) 申請方法：人事システムより申請
(3) 承認：上長の承認が必要

3. 特別休暇
- 結婚休暇：5日間
- 忌引休暇：続柄により1〜5日間
- 出産休暇：産前6週間、産後8週間

4. その他の制度
- フレックスタイム制度
- テレワーク制度
- 時短勤務制度`
      }
    ];
    
    // ファイル作成
    for (const file of sampleFiles) {
      const filepath = path.join(sampleDir, file.filename);
      await fs.writeFile(filepath, file.content, 'utf8');
      console.log(`✅ Created: ${file.filename}`);
    }
    
    console.log('\n📁 サンプルファイルが作成されました: ' + sampleDir);
    console.log('これらのファイルをWord/PDFに変換してアップロードしてください。');
    
  } catch (error) {
    console.error('Error creating sample files:', error);
  }
}

// 実行
createSampleFiles(); 