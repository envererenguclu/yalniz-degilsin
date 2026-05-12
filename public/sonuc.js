const puan = Number(localStorage.getItem("puan")) || 0;
const maxPuan = Number(localStorage.getItem("maxPuan")) || 0;
const sonuc = localStorage.getItem("sonuc");
const ad = localStorage.getItem("ad") || "Kullanıcı";

const baslik = document.getElementById("sonucBaslik");
const metin = document.getElementById("sonucMetni");
const seviye = document.getElementById("sonucSeviye");
const kart = document.getElementById("sonucKart");
const progress = document.getElementById("progressFill");
const puanText = document.getElementById("puanText");

const oran = maxPuan > 0 ? Math.round((puan / maxPuan) * 100) : 0;

puanText.innerText = `${puan} / ${maxPuan}`;

if (!sonuc) {
  seviye.innerText = "Sonuç Yok";
  baslik.innerText = "Sonuç bulunamadı";
  metin.innerText = "Lütfen önce testi doldur.";
  kart.classList.add("result-neutral");
  progress.style.width = "10%";
}

else if (sonuc === "hafif") {
  baslik.innerText = "Hafif Düzey Farkındalık";
  metin.innerText = `${ad}, verdiğin cevaplara göre hafif düzeyde zorlanmalar yaşıyor olabilirsin. Günlük rutinini düzenlemek, nefes egzersizlerini denemek ve başa çıkma yöntemlerini incelemek faydalı olabilir.`;
  kart.classList.add("result-low");
  progress.style.width = `${oran}%`;
}

else if (sonuc === "orta") {
  baslik.innerText = "Orta Düzey Destek İhtiyacı";
  metin.innerText = `${ad}, cevapların kaygı, yalnızlık veya anlaşılmama hissinin arttığını gösterebilir. Kendini ifade edebileceğin anonim alanı kullanabilir ve güvendiğin biriyle konuşmayı deneyebilirsin.`;
  kart.classList.add("result-mid");
  progress.style.width = `${oran}%`;
}

else if (sonuc === "yuksek") {
  baslik.innerText = "Daha Fazla Destek Faydalı Olabilir";
  metin.innerText = `${ad}, cevapların daha yoğun bir zorlanma yaşadığını gösterebilir. Bu test tanı koymaz; ancak bu duygular uzun süredir devam ediyorsa bir rehberlik servisi, aile bireyi veya uzmandan destek almak faydalı olabilir.`;
  kart.classList.add("result-high");
  progress.style.width = `${oran}%`;
}
const benzerKisi = document.getElementById("benzerKisi");

if (sonuc) {
  fetch(`/sonuc-istatistik/${sonuc}`)
    .then(res => res.json())
    .then(data => {
      const kisiSayisi = Math.max(data.sayi - 1, 0);

      if (kisiSayisi === 0) {
        benzerKisi.innerText = "Şu anda bu sonucu alan ilk kullanıcılardan birisin.";
      } else {
        benzerKisi.innerText = `Seninle benzer sonucu alan ${kisiSayisi} kişi daha var.`;
      }
    });
}
const gelisimDurumu = document.getElementById("gelisimDurumu");
const iyilesmeFarki = localStorage.getItem("iyilesmeFarki");

const anonimMi = localStorage.getItem("anonimMi");

if (anonimMi === "true") {

    gelisimDurumu.innerText =
    "Anonim devam ettiğin için önceki testlerin karşılaştırılamıyor.";

} else if (iyilesmeFarki === "null" || iyilesmeFarki === null) {

    gelisimDurumu.innerText =
    "Bu senin ilk testin. Sonraki testlerinde gelişimin karşılaştırılacak.";

} else {

    const fark = Number(iyilesmeFarki);

    if (fark > 0) {
        gelisimDurumu.innerText =
        `Önceki testine göre ${fark} puan daha iyi görünüyorsun.`;

    } else if (fark < 0) {

        gelisimDurumu.innerText =
        `Önceki testine göre ${Math.abs(fark)} puan daha fazla zorlanma görünüyor. Kendine dikkat etmen faydalı olabilir.`;

    } else {

        gelisimDurumu.innerText =
        "Önceki testinle aynı seviyedesin.";
    }
}
const odaButonu = document.getElementById("odaYonlendirme");

if (odaButonu) {
  if (sonuc === "hafif") {
    odaButonu.href = "/oda/motivasyon";
    odaButonu.innerText = "Motivasyon Odasına Git";
  } else if (sonuc === "orta") {
    odaButonu.href = "/oda/yalnizlik";
    odaButonu.innerText = "Yalnızlık ve Anlaşılmama Odasına Git";
  } else if (sonuc === "yuksek") {
    odaButonu.href = "/oda/kaygi";
    odaButonu.innerText = "Kaygı Destek Odasına Git";
  }
}