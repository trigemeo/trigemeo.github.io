# 🌐 Trigemeo Studio — Official Website Project (`trigemeo.com`)

Репозиторий и исходный код официального веб-сайта инди-студии разработки игр и цифровых продуктов **Trigemeo** (`https://trigemeo.com`).

---

## 🎯 Миссия сайта
Создать легкий, стильный, высокоскоростной статический сайт-витрину с каталогом игр и утилит, полностью удовлетворяющий требованиям **Apple Developer Program**, **Google Play Console**, **D-U-N-S**, а также европейскому регламенту **GDPR**.

---

## 🎨 Дизайн и Тон (Design & Tone of Voice)
- **Стиль:** Cyber-indie / Neo-tactile. Тёмная тема по умолчанию, неоновые/акцентные акценты (циан/фиолетовый/янтарный), микро-анимации наведения, интерактивные карточки проектов.
- **Голос бренда (Tone of Voice):** Живой, уверенный, с легкой долей иронии разработчиков («варим кофе, ломаем физику, создаем игры с душой»), без бюрократии и без детской инфантильности («уси-пуси»).
- **Слоган:** *"Crafting bite-sized games & sharp digital tools. Built with passion, tuned for fun."*

---

## 🏗️ Структура страниц и файлов

```
Trigemeo-Website/
├── index.html            # Главная страница (Hero, О студии, Витрина игр/приложений, Контакты, Футер)
├── projects/
│   └── index.html        # Полный интерактивный каталог проектов (Фильтры: All, Games, Utility Apps)
├── support/
│   └── index.html        # Центр поддержки игроков, FAQ, форма обратной связи, Account & Data Deletion
├── privacy/
│   └── index.html        # Политика конфиденциальности (GDPR, COPPA, Google Play & Apple App Privacy)
├── terms/
│   └── index.html        # Пользовательское соглашение (Terms of Service / EULA)
├── 404.html              # Страница ошибки 404 (с ироничным текстом и кнопкой возврата)
└── assets/
    ├── css/style.css     # CSS Variables, Dark Theme, Modern Layout (Flexbox/Grid)
    ├── js/main.js        # Минимальный JS (фильтрация проектов, мобильное меню, аккордеон FAQ)
    └── img/              # Логотипы, бейджи сторов, иконки проектов
```

---

## 🎮 Реальный каталог проектов для витрины

### 🎲 Игры (Games):
1. **Brandub (Флагманский дебют):**
   - *Жанр:* Ancient Viking & Celtic Strategy Board Game.
   - *Описание:* Аутентичная настольная игра викингов на фактурной деревянной доске с резными фишками, глубокой тактикой и саундтреком.
   - *Бейдж:* `[Coming Soon to App Store & Google Play]`
2. **Trigemeo (Именная игра студии):**
   - *Жанр:* Innovative Spatial Pyramid Rolling Puzzle.
   - *Описание:* Уникальная авторская механика перекатывания 3D-пирамидок вокруг граней соседних фигур для создания монолитных структур.
   - *Бейдж:* `[In Development]`
3. **Sorter:**
   - *Жанр:* Geographic & Cultural Discovery Puzzle.
   - *Описание:* Познавательный сортер по странам мира, артефактам и культурным символам.
   - *Бейдж:* `[In Development]`
4. **Rotolock:**
   - *Жанр:* Hardcore Gear & Rotor Lock Cyber-Puzzle.
   - *Описание:* Механическая головоломка для любителей сложных шестереночных замков.
   - *Бейдж:* `[R&D Lab]`

### 📱 Полезные приложения (Apps & Helpers):
1. **Portuguese with Bernie:**
   - *Жанр:* Master European Portuguese with Bernie the Dog.
   - *Описание:* Интерактивный интеллигентный тренажер португальского языка с маскотом Берни.
   - *Бейдж:* `[Beta Soon]`
2. **Aukro AI:**
   - *Жанр:* One-Photo AI Listing Generator for Sellers.
   - *Описание:* Умный ассистент для онлайн-продаж на барахолках (Aukro, OLX, eBay) через Google Gemini Vision API.
   - *Бейдж:* `[Beta / Labs]`
3. **Guitar Chords & Tuner:**
   - *Жанр:* Interactive Chord Toolkit & Tuner for Musicians.
   - *Описание:* Интерактивный справочник гитарных аккордов с живым звуком струн и тюнером.
   - *Бейдж:* `[In Development]`

---

## 🏛️ Юридические реквизиты для футера (Footer Compliance)

- **Копирайт:** `© 2026 Trigemeo Studio. All Rights Reserved.`
- **Юрлицо:** `Trigemeo is operated by Freebird s.r.o. | IČO: 27942350 | Prague, Czech Republic`
- **Контакты:** `dev@trigemeo.com` | `support@trigemeo.com` | `legal@trigemeo.com`

---

## ⚡ Технические требования
- Чистый семантический HTML5 + чистый CSS3 + Vanilla JS.
- Нулевые тяжелые зависимости (без React/Node/Webpack), мгновенный запуск.
- Скорость загрузки < 0.5s (100/100 Google PageSpeed).
- Адаптивность от iPhone SE (320px) до 4K мониторов.
- Полная готовность к развертыванию на **Cloudflare Pages** или **GitHub Pages**.
