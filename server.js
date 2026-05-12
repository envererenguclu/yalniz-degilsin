const express = require("express");
const mysql = require("mysql2");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL bağlandı 🔥");
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/belirtiler", (req, res) => {
  res.render("belirtiler");
});
app.get("/basa-cikma", (req, res) => {
  res.render("basa-cikma");
});
app.get("/yardim", (req, res) => {
  res.render("yardim");
});
app.get("/gelistiriciler", (req, res) => {
  res.render("gelistiriciler");
});
app.get("/test", (req, res) => {
  res.render("test");
});
app.get("/sonuc", (req, res) => {
  res.render("sonuc");
});
app.post("/test-kaydet", (req, res) => {
  
const { ad, soyad, yas, stres, puan, maxPuan, sonuc, kullanici_kodu, anonimTest } = req.body;
if (anonimTest) {
  return res.json({
    success: true,
    puan,
    maxPuan,
    sonuc,
    benzerSayi: 0,
    oncekiFark: null,
    anonim: true
  });
}

  const kullaniciAdi = ad || "Anonim";

  db.query(
    `SELECT puan FROM test_sonuclari
 WHERE kullanici_kodu = ?
 ORDER BY id DESC
 LIMIT 1`,
    [kullanici_kodu],
    (err, eskiSonuc) => {
      if (err) {
        console.error(err);
        return res.json({ success: false });
      }

      let fark = null;

      if (eskiSonuc.length > 0) {
        fark = eskiSonuc[0].puan - puan;
      }

      const sql = `
        INSERT INTO test_sonuclari 
        (ad, yas, stres, puan, max_puan, sonuc)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(sql, [ad, soyad, kullanici_kodu, yas, stres, puan, maxPuan, sonuc], (err) => {
        if (err) {
          console.error(err);
          return res.json({ success: false });
        }

        res.json({ success: true, fark });
      });
    }
  );
});

app.get("/sonuc-istatistik/:sonuc", (req, res) => {
  const sonuc = req.params.sonuc;

  db.query(
    "SELECT COUNT(*) AS sayi FROM test_sonuclari WHERE sonuc = ?",
    [sonuc],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.json({ sayi: 0 });
      }

      res.json({ sayi: results[0].sayi });
    }
  );
});
app.get("/anonim", (req, res) => {
  const sayfa = Number(req.query.sayfa) || 1;
  const limit = 5;
  const offset = (sayfa - 1) * limit;

  db.query(
    "SELECT COUNT(*) AS toplam FROM mesajlar WHERE oda = 'anonim'",
    (err, countResult) => {
      if (err) throw err;

      const toplamMesaj = countResult[0].toplam;
      const toplamSayfa = Math.ceil(toplamMesaj / limit);

      db.query(
        "SELECT * FROM mesajlar WHERE oda = 'anonim' ORDER BY id DESC LIMIT ? OFFSET ?",
        [limit, offset],
        (err, mesajlar) => {
          if (err) throw err;

          res.render("anonim", {
            mesajlar,
            sayfa,
            toplamSayfa
          });
        }
      );
    }
  );
});
app.get("/destek-odalari", (req, res) => {
  res.render("destek-odalari");
});


app.get("/oda/:odaAdi", (req, res) => {
  const odaAdi = req.params.odaAdi;

  const sayfa = Number(req.query.sayfa) || 1;
  const limit = 10;
  const offset = (sayfa - 1) * limit;

  db.query(
    "SELECT COUNT(*) AS toplam FROM mesajlar WHERE oda = ?",
    [odaAdi],
    (err, countResult) => {
      if (err) throw err;

      const toplamMesaj = countResult[0].toplam;
      const toplamSayfa = Math.ceil(toplamMesaj / limit);

      db.query(
        "SELECT * FROM mesajlar WHERE oda = ? ORDER BY id DESC LIMIT ? OFFSET ?",
        [odaAdi, limit, offset],
        (err, mesajlar) => {
          if (err) throw err;

          res.render("oda", {
            odaAdi,
            mesajlar,
            sayfa,
            toplamSayfa
          });
        }
      );
    }
  );
});

app.post("/mesaj", (req, res) => {
  const { mesaj } = req.body;

  db.query(
    "INSERT INTO mesajlar (mesaj, oda, kullanici_adi) VALUES (?, ?, ?)",
    [mesaj, "anonim", "Anonim Kullanıcı"],
    (err) => {
      if (err) throw err;
      res.redirect("/anonim");
    }
  );
});
io.on("connection", (socket) => {
  console.log("Bir kullanıcı sohbete bağlandı");

  socket.on("oda-katil", (odaAdi) => {
    socket.join(odaAdi);
  });

  socket.on("oda-mesaj", (data) => {
    const { odaAdi, kullanici_adi, mesaj } = data;

    db.query(
      "INSERT INTO mesajlar (mesaj, oda, kullanici_adi) VALUES (?, ?, ?)",
      [mesaj, odaAdi, kullanici_adi || "Anonim Kullanıcı"],
      (err) => {
        if (err) throw err;

        io.to(odaAdi).emit("oda-mesaj", {
          kullanici_adi: kullanici_adi || "Anonim Kullanıcı",
          mesaj,
          tarih: new Date().toLocaleString("tr-TR")
        });
      }
    );
  });
});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Sunucu çalışıyor");
});