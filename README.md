#### **NFTIN**

![image](https://github.com/ekoyanu99/nftin/assets/36530602/344d967e-2780-4805-a8fc-f90096c7bbc4)
NFT Minting allowList with Gitcoin Passport

Istilah sybil untuk developer dan pengguna crypto sudah tidak asing lagi. Sybil merupakan istilah yang dimana seorang individu menjalankan beberapa identitas untuk memanipulasi sistem atau event. Sybil attacker sebutan untuk orang yang melakukan serangan sybil.

Gitcoin memperkenalkan Gitcoin Passport sebuah aplikasi identitas verifikasi dengan cara mengumpulkan *veriifable credential. Veriifable credential*  digunakan untuk mengidentifikasi kepercayaan individu tanpa mengekspose informasi identitas. 
#### **Major Concepts Gitcoin Passport**
Passport Gitcoin berupa format data JSON. Setiap passport berisi field dengan nama stamp. Seluruh object Pasport disimpan pada network ceramic dan dikaitkan dengan wallet EVM Anda. 

Scorer Passport API dapat digunakan developer untuk interaksi dengan Passport Protocol. Nilai score tiap stamp dijumlahkan sebagai bentuk dari Sybil defense.

![gitcoin stamp](https://github.com/ekoyanu99/nftin/assets/36530602/cc2d0b77-7c33-4146-a85f-b63327ff727a)

Mekanisme yang digunakan sebagai stamp diantaranya verify twitter, akun google, partisipasi gitcoin grants sebelumnya. Setiap stamp memiliki nilai yang berbeda dapat dicek di [Passport Github](https://github.com/gitcoinco/passport-scorer/blob/main/api/scorer/settings/gitcoin_passport_weights.py)

#### **NFTIN**
NFTIN adalah dapp minting NFT dengan Gitcoin Passport sebagai Sybil defense. Berikut adalah diagram alir NFTIN dimulai dari checking score hingga minting NFT. 

![nftin app](https://github.com/ekoyanu99/nftin/assets/36530602/0886e4ea-e85d-4341-8b73-5e423af6b294)

#### **Installation** 
1. Clone the repo

git clone <https://github.com/ekoyanu99/nftin>

2. Install packages

npm install

3. Start development

npm run dev

Modify abi, contract, and uri ipfs on the file Index.jsx

**Author**

[Twitter](https://twitter.com/ekoyanu99)

**Reference**

- https://docs.passport.gitcoin.co/building-with-passport/integration-guides/requiring-a-passport-score-for-airdrop-claim#app-overview
- https://createweb3dapp.alchemy.com/
