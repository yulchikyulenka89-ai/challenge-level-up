# English Level Up — подробное ТЗ на сайт-Tool с геймификацией

## 0. Назначение документа

Этот файл — рабочее техническое и продуктово-дизайнерское ТЗ для создания **English Level Up**: закрытой яркой digital-платформы для подростков 12–14 лет, в которой 8-недельный B1-челлендж выглядит как фестивальный сезон, а не как электронный журнал.

Документ описывает:

- структуру сайта;
- визуальный стиль;
- 8-недельный сценарий;
- геймификацию;
- 8 типов ассетов;
- карточки учеников;
- удобный трекер прогресса;
- кабинет администратора;
- загрузку и замену фотографий учеников;
- способы ручного и автоматического редактирования данных;
- анимации и micro-interactions;
- авторизацию Google/VK;
- безопасность и приватность;
- структуру данных;
- MVP и дальнейшее развитие.

---

# 1. Продукт и аудитория

## 1.1 Что это за Tool

**English Level Up** — закрытая интерактивная платформа для одной небольшой группы, где ученики проходят **8 недель от сентября до осенних каникул**.

Текущая группа:

- **Алена** — девочка;
- **Анастасия** — девочка;
- **Егор** — мальчик;
- **Кирилл** — мальчик.

Уровень группы: **B1**.

Главная эмоция продукта:

> «Я участвую в ярком English-сезоне, собираю вещи, открываю контент, прокачиваюсь и двигаюсь к финальной сцене».

Это не должно ощущаться как:

- школьный электронный дневник;
- CRM;
- обычный список домашних заданий;
- таблица успеваемости;
- корпоративный SaaS.

Это должно ощущаться как смесь:

- social app;
- festival app;
- gaming lobby;
- collectible game;
- challenge tracker;
- backstage / event experience.

---

# 2. Главная концепция сезона

## 2.1 Формат

Сезон длится **8 недель**.

Каждая неделя имеет:

1. одно главное событие / тему;
2. одну основную миссию;
3. один ведущий игровой ассет;
4. награду;
5. optional secret bonus;
6. XP;
7. визуальное состояние `locked / available / active / completed`.

## 2.2 8 недель

| Неделя | Название | Главная миссия | Главный ассет |
|---|---|---|---|
| 1 | **Who Am I?** | Two Truths & One Lie | Ticket |
| 2 | **English in the Wild** | Найти живой английский вокруг себя | Sticker |
| 3 | **Mystery Case** | Командное расследование | Access Key |
| 4 | **Speak Fest** | 60 секунд на случайную тему | Power Card |
| 5 | **Creator Week** | Короткий creator-контент на английском | Drop |
| 6 | **Real Life Mode** | Ролевая ситуация + Plot Twist | Badge |
| 7 | **Crew Project** | Один общий проект на четверых | Crew Token |
| 8 | **Main Stage** | Финальное выступление | Spotlight |

## 2.3 Принцип сложности

Не делать 5–7 обязательных упражнений каждую неделю.

Правило:

> **1 неделя = 1 главная вау-миссия + 1 необязательный secret bonus.**

Так продукт остается легким, мотивирующим и не превращается в еще одну домашку.

---

# 3. Визуальная система

## 3.1 Основной стиль

Основа — тот визуальный язык, который уже выбран:

- темный navy / indigo фон;
- neon pink;
- electric blue;
- acid lime;
- violet;
- hot orange;
- желтые акценты;
- белый текст;
- glow, но без потери читаемости;
- фестивальные прожекторы;
- light streaks;
- stickers;
- graffiti-типографика;
- ticket / card / badge / stage motifs.

## 3.2 Дизайн должен быть подростковым, но не детским

Использовать:

- digital festival;
- music-event vibe;
- fashion / sneaker / youth culture references;
- arcade/game energy;
- social profile cards;
- коллекционные предметы;
- красивые градиенты;
- смелую типографику.

Не использовать как основной стиль:

- «милые конфетки»;
- слишком детские персонажи;
- школьные тетрадные элементы;
- стандартные круглые медальки для всего;
- белый скучный dashboard;
- чрезмерно мелкий текст;
- одинаковые карточки для всех типов контента.

## 3.3 Типографика

Три уровня:

1. **Display / brush / graffiti** — логотип, `SPEAK FEST`, `MAIN STAGE`, крупные эмоциональные заголовки.
2. **UI Bold** — кнопки, названия недель, карточки.
3. **UI Readable** — статистика, инструкции, админ-формы.

Важно: декоративный шрифт не использовать для длинных текстов, чисел и админки.

## 3.4 Карточки

Общие свойства:

- border radius 18–24 px;
- темная полупрозрачная подложка;
- тонкая neon border;
- subtle inner glow;
- hover elevation;
- 1–2 акцентных цвета на карточку;
- понятная иконка;
- одна главная цифра / action;
- визуальная иерархия: имя → статус → прогресс → награда.

---

# 4. Анимированная hero-сцена без видео

## 4.1 Festival stage

Hero использует существующий фестивальный reference как статичный фон и лёгкие CSS/SVG-слои:

- тёмная концертная / фестивальная сцена;
- медленно движущиеся pink, purple и cyan light beams;
- confetti dots и glowing particles;
- neon doodles: star, bolt, crown, arrow, music note;
- мягкий gradient overlay и vignette;
- крупный контрастный текст `ENGLISH LEVEL UP`.

## 4.2 Технические требования

- никаких фоновых роликов и автозапуска медиаконтента;
- движение строится на `transform`, `opacity`, CSS gradients и SVG;
- entry-анимация проигрывается один раз;
- декоративное движение спокойное, без flashing;
- `prefers-reduced-motion` отключает beams, particles и крупные transitions;
- текст и кнопки всегда сохраняют достаточный контраст.

## 4.3 Декоративные слои

Допустимы медленные particles, confetti dots, light streaks, graffiti strokes, subtle parallax и маленькие star / bolt / crown doodles. Не должно быть постоянной визуальной перегрузки.

---

# 5. Курсор и micro-interactions

## 5.1 Custom cursor

Только desktop.

Базовый курсор:

- маленькая светящаяся точка;
- внешнее мягкое кольцо;
- небольшая инерция движения.

Контекстные состояния:

- `VIEW` на карточке;
- `OPEN` на Drop;
- `PLAY` на миссии;
- ⚡ на Power Card;
- 🔑 на Access Key;
- ⭐ на Badge;
- мини-замок на locked content.

На input/textarea должен оставаться обычный text-cursor.

На mobile custom cursor отключить.

## 5.2 Hover

- tilt карточки 1–3°;
- glow border усиливается;
- Badge получает shine;
- Sticker слегка подпрыгивает;
- Ticket немного «приподнимается»;
- Access Key дает pulse;
- Spotlight кратко включает beam;
- Power Card слегка поворачивается как коллекционная карта.

## 5.3 Click / reward feedback

- кнопка слегка сжимается;
- `+XP` вылетает вверх;
- completed → mini-confetti;
- Badge → reveal;
- Drop → shake → flash → reveal;
- Power Card → flip;
- Access Key → lock animation;
- Crew Token → летит в общий Crew Meter;
- Spotlight → короткая сценическая подсветка.

---

# 6. 8 игровых ассетов

Важно: это **8 разных функций**, а не 8 декоративных иконок.

## 6.1 Ticket = путь

Назначение: прогресс по сезону.

Визуал:

- реальный festival ticket;
- номер недели;
- дата;
- перфорация;
- barcode / QR декоративно;
- holographic foil;
- статусный штамп.

Состояния:

- locked;
- available;
- active;
- completed.

После выполнения:

`COMPLETED` / `CHECKED IN` stamp.

## 6.2 Power Card = действие

Назначение: временная игровая способность.

Примеры:

- Second Chance;
- Ask a Friend;
- No Pause;
- Double XP;
- Mic Drop;
- Plot Twist.

UI:

- 3D card tilt;
- flip reveal;
- rarity border;
- использованные карты получают `USED` state.

## 6.3 Access Key = открытие

Назначение: открывает скрытый контент.

Может открывать:

- Secret Mission;
- Bonus Event;
- hidden reward;
- secret creator pack;
- final bonus round.

UI:

- cyber key;
- digital lock;
- `LOCKED → UNLOCKED` animation.

## 6.4 Badge = статус

Постоянное достижение.

Примеры:

- Brave Speaker;
- Language Hunter;
- Sound Detective;
- Real-Life Survivor;
- Creative Mind;
- Crew Hero;
- Main Stage Star.

Rarity:

- common;
- rare;
- epic;
- legendary.

## 6.5 Drop = сюрприз

Случайная награда.

Может содержать:

- XP;
- Sticker;
- Power Card;
- Badge;
- Access Key;
- cosmetic reward.

Визуал:

- mystery crate;
- вопросительный знак;
- glow по rarity;
- reveal animation.

## 6.6 Crew Token = вклад

Получается за помощь команде.

Причины выдачи:

- помог teammate;
- дал полезный feedback;
- сделал свою часть Crew Project;
- поддержал другого;
- выполнил командную роль.

Crew Tokens визуально должны лететь в общий Team / Crew Meter.

## 6.7 Sticker = самовыражение

Косметический предмет профиля.

Примеры:

- ON FIRE;
- GOOD VIBES;
- YOU CAN;
- NO CAP;
- MIC DROP;
- ROCK STAR;
- KEEP GOING;
- FOUND IT;
- SPEAK UP.

Ученик выбирает до 3 featured stickers.

## 6.8 Spotlight = признание

Временная награда за сильный результат / рост / вклад.

Примеры:

- Speaker of the Week;
- Biggest Glow-Up;
- Most Creative;
- Best Teammate;
- Comeback of the Week.

Визуал:

- stage light;
- карточка-постер;
- beam;
- featured position на Home / Profile.

---

# 7. Основная структура сайта

## 7.1 Student navigation

- Home;
- Challenge;
- Missions;
- Crew;
- Assets;
- Events;
- Leaderboard;
- Feed;
- Profile.

## 7.2 Home — главный экран

За 5 секунд ученик должен понять:

1. какая сейчас неделя;
2. что ему надо сделать;
3. сколько у него XP;
4. как идет команда;
5. что можно открыть / получить.

Блоки:

1. Hero с анимированной CSS/SVG festival stage;
2. 8-week roadmap;
3. Current Mission;
4. 4 карточки учеников;
5. Crew Power;
6. Upcoming Event;
7. Leaderboard;
8. Feed;
9. mini Asset Collection.

---

# 8. Карточки учеников

Текущие ученики:

- Алена — девочка;
- Анастасия — девочка;
- Егор — мальчик;
- Кирилл — мальчик.

## 8.1 Что показывать на карточке

- фото / avatar;
- имя;
- optional nickname;
- B1;
- game level;
- current XP;
- streak;
- current week progress;
- 3 featured stickers;
- 1 featured badge;
- Spotlight state;
- optional online indicator.

## 8.2 Главное правило по фото

**Администратор должен иметь возможность самостоятельно загружать, заменять и удалять фотографии детей без участия разработчика.**

Фотография не должна быть «зашита» в код или дизайн.

---

# 9. Загрузка и редактирование фотографий учеников

Это обязательная часть админки.

## 9.1 Что должен уметь администратор

Для каждого ученика:

- `Upload photo`;
- drag & drop файла;
- выбрать файл с компьютера/телефона;
- заменить текущую фотографию;
- удалить фотографию;
- вернуть placeholder/avatar;
- crop;
- zoom;
- reposition;
- задать focal point;
- preview перед сохранением.

## 9.2 Crop UI

После загрузки открывается простой modal:

- круглый preview для карточки;
- квадратный preview для профиля;
- zoom slider;
- drag image;
- кнопки `Save / Cancel / Remove`.

Рекомендуемое хранение оригинала + производных thumbnails.

## 9.3 Форматы

Разрешить:

- JPG;
- PNG;
- WebP.

Ограничить:

- размер файла, например до 8–10 MB;
- минимальное разрешение;
- запрещенные типы файлов.

Сервер должен создавать оптимизированные версии:

- 64×64;
- 128×128;
- 256×256;
- optional 512×512.

## 9.4 Placeholder

Если фото нет:

- красивый неоновый monogram/avatar;
- первая буква имени;
- цвет рамки по профилю;
- не использовать случайное лицо.

## 9.5 Важно для приватности

Так как это несовершеннолетние:

- фото видны только авторизованным участникам закрытой группы;
- student pages не индексируются;
- фото не должны иметь публичные прямые URL без необходимости;
- не показывать email/телефон рядом;
- админ может удалить фото полностью;
- использование реальных фото должно соответствовать применимым требованиям и необходимым согласиям.

---

# 10. Профиль ученика

## 10.1 Profile Header

- фото;
- имя;
- ник;
- B1;
- current game level;
- XP;
- streak;
- featured badge;
- selected stickers;
- Spotlight.

## 10.2 Season Progress

Для 8 недель:

- week number;
- title;
- state;
- progress;
- completed at;
- XP earned;
- bonus completed;
- earned asset.

## 10.3 Asset Collection

Разделы:

- Tickets;
- Power Cards;
- Access Keys;
- Badges;
- Drops;
- Crew Tokens;
- Stickers;
- Spotlights.

## 10.4 Stats

- total XP;
- XP this week;
- missions completed;
- secret bonuses;
- streak current;
- streak max;
- teammate helps;
- Crew Tokens earned;
- speaking events;
- creator uploads;
- current rank;
- weekly growth.

---

# 11. Что именно нужно заносить в трекер

Трекер должен быть **простым для преподавателя**. Не заставлять вручную вводить всё, что можно посчитать автоматически.

Принцип:

> Администратор вводит только исходные события и решения; агрегаты и проценты сайт считает сам.

## 11.1 Минимальный набор по ученику

Редактируемые данные:

- имя;
- фото;
- nickname, если нужен;
- уровень CEFR, сейчас B1;
- активен / неактивен;
- текущая неделя, если нужен override;
- admin note;
- featured stickers;
- featured badge;
- Spotlight.

Автоматически рассчитывать:

- total XP;
- rank;
- current week progress;
- total completed;
- asset count;
- crew contribution totals.

## 11.2 Что удобно фиксировать по каждой неделе

Для каждого ученика и каждой недели:

- статус: `Not started / In progress / Submitted / Needs revision / Completed`;
- progress %;
- дата выполнения;
- XP за основную миссию;
- secret bonus выполнен / нет;
- bonus XP;
- комментарий преподавателя;
- ссылка/файл ответа, если есть;
- выданный ассет;
- время последнего изменения.

## 11.3 Что удобно фиксировать по submission

Поддержать типы:

- текст;
- ссылка;
- фото;
- аудио;
- видео;
- файл;
- «выполнено офлайн» без файла.

Поля:

- submission type;
- submitted at;
- file/link/text;
- status;
- teacher note;
- approved at;
- revision requested at.

## 11.4 Что не надо вводить вручную

Сайт сам считает:

- total XP;
- место в рейтинге;
- % прогресса;
- Crew Power;
- число completed missions;
- asset count;
- weekly growth;
- earned milestones;
- leaderboard ordering.

Администратор может сделать **manual correction**, но это должно фиксироваться в истории.

---

# 12. Система прогресса

## 12.1 Week Progress

Для MVP рекомендуется 4 состояния:

- 0% — Not started;
- 25–75% — In progress;
- 90% — Submitted / waiting review;
- 100% — Completed.

Если миссия бинарная, progress можно упростить до статусов.

## 12.2 XP

XP не редактировать как одно «магическое число» без истории.

Использовать **XP transactions**:

```text
+300 Speak Fest completed
+50 Secret Bonus
+100 Crew contribution
-50 Manual correction
```

Плюсы:

- понятна история;
- можно откатить ошибку;
- можно построить график;
- легко объяснить total XP.

## 12.3 Streak

Нужно заранее определить правило.

Для данного проекта лучше не делать «каждый день или streak сгорит», чтобы не создавать лишнего давления.

Рекомендуемый вариант:

- streak = количество последовательных активных недель / чек-инов;
- либо teacher-defined engagement streak.

В админке правило должно быть явно подписано.

---

# 13. Админ-кабинет — основная идея

Админка должна быть **быстрее таблицы**, а не сложнее нее.

Доступ — только владельцу проекта.

## 13.1 Доступ

Нужно:

- отдельная роль `admin`;
- allowlist конкретного Google/VK account id и/или email;
- server-side authorization;
- проверка каждого admin API action;
- audit log;
- optional 2FA.

Скрытого URL недостаточно.

## 13.2 Главный экран админки

Показывать:

- 4 student cards;
- current week;
- pending reviews;
- последние submissions;
- кто еще не начал;
- кто ожидает проверки;
- кто недавно получил XP;
- Crew Power;
- ближайшее событие;
- быстрые действия.

Quick Actions:

- `+ Add XP`;
- `Mark Complete`;
- `Request Revision`;
- `Give Badge`;
- `Give Sticker`;
- `Give Power Card`;
- `Unlock Access Key`;
- `Create Drop`;
- `Give Crew Token`;
- `Set Spotlight`;
- `Edit Week`;
- `Create Event`;
- `Upload / Change Photo`.

---

# 14. Удобный интерфейс редактирования ученика

## 14.1 Quick drawer

Клик по student card → справа открывается drawer.

В drawer:

### Основное

- фото;
- `Change photo`;
- имя;
- nickname;
- B1;
- active status.

### Current Week

- status;
- progress;
- main mission complete;
- secret bonus;
- submission;
- teacher note.

### XP

- current total;
- `+ Add XP`;
- `- Correct XP`;
- transaction history.

### Assets

- Ticket;
- Power Cards;
- Access Keys;
- Badges;
- Drops;
- Crew Tokens;
- Stickers;
- Spotlight.

### Activity

- recent actions;
- completed weeks;
- latest rewards.

## 14.2 Inline edit

Примеры:

- клик по имени → редактирование;
- клик по статусу → dropdown;
- клик по progress → slider / value;
- клик по badge → choose asset;
- клик по photo → upload/crop modal.

Важно: не делать inline-edit для потенциально опасных действий без подтверждения, например удаление профиля.

## 14.3 Save behavior

Для простых полей:

- autosave после выбора;
- toast `Saved`;
- возможность Undo 5–10 секунд.

Для длинных форм:

- `Save changes`;
- `Cancel`;
- warning при закрытии с несохраненными изменениями.

---

# 15. Таблица / Tracker View для администратора

Кроме красивой student view нужна **рабочая таблица**, чтобы быстро управлять группой.

## 15.1 Столбцы

Рекомендуемые столбцы:

| Поле | Тип | Редактирование |
|---|---|---|
| Photo | image | click → upload/change |
| Student | text | inline |
| Week | select | dropdown |
| Status | select | dropdown |
| Progress | % | slider/input |
| Main Mission | checkbox/status | click |
| Secret Bonus | checkbox | click |
| XP This Week | number | transaction action |
| Streak | number/auto | edit if allowed |
| Featured Badge | asset | picker |
| Stickers | asset | multi-select |
| Crew Tokens | count | quick add |
| Submission | link/file | open |
| Teacher Note | text | drawer |
| Last Updated | datetime | auto |

## 15.2 Фильтры

- All;
- Not started;
- In progress;
- Submitted;
- Needs revision;
- Completed;
- Has pending submission;
- Spotlight;
- by week.

## 15.3 Bulk actions

Для выбранных учеников:

- +50 XP;
- mark week complete;
- unlock next week;
- give Crew Token;
- give Sticker;
- send same note;
- change active week.

## 15.4 Поиск

Для 4 человек поиск необязателен, но архитектуру можно оставить на будущее.

---

# 16. Что администратор должен редактировать

## 16.1 Student

- имя;
- фото;
- nickname;
- CEFR level;
- active/inactive;
- current week override;
- progress;
- notes;
- featured badge;
- stickers;
- Spotlight;
- assets;
- manual correction records.

## 16.2 Week / Challenge

- week number;
- title;
- short title;
- description;
- start date;
- end date;
- main mission;
- instructions;
- XP reward;
- secret bonus;
- bonus XP;
- main asset type;
- reward asset;
- theme color;
- icon;
- hero media;
- locked/unlocked;
- active/completed.

## 16.3 Event

- title;
- type;
- date;
- time;
- description;
- event artwork;
- reward;
- participants;
- status;
- featured;
- countdown on/off.

## 16.4 Asset

- type;
- title;
- slug;
- image/icon;
- rarity;
- description;
- value;
- ability;
- active period;
- visual skin;
- transferable: false by default;
- usable / cosmetic / permanent.

---

# 17. Admin workflow — типовые сценарии

## 17.1 Добавить/заменить фото ребенка

1. Admin → Students.
2. Открыть карточку Алены / Анастасии / Егора / Кирилла.
3. Нажать на фото.
4. `Upload / Change Photo`.
5. Выбрать файл.
6. Crop + zoom + reposition.
7. Preview в круглом и квадратном формате.
8. `Save`.
9. Изображение автоматически обновляется в Profile, Leaderboard, Feed и student cards.

## 17.2 Отметить миссию выполненной

1. Открыть student drawer.
2. Current Week → `Mark Complete`.
3. Система показывает ожидаемую награду.
4. Admin подтверждает.
5. Создается completion record.
6. Создается XP transaction.
7. Выдается asset reward, если предусмотрен.
8. Feed получает auto-event.
9. Progress обновляется.

## 17.3 Добавить XP вручную

1. `+ Add XP`.
2. Ввести количество.
3. Выбрать reason из списка или `Other`.
4. Optional note.
5. Save.

Reason examples:

- Main Mission;
- Secret Bonus;
- Great Speaking;
- Crew Contribution;
- Event;
- Teacher Bonus;
- Correction.

## 17.4 Выдать Asset

1. Student → Assets → `Give Asset`.
2. Выбрать type.
3. Выбрать asset.
4. Optional reason.
5. Save.
6. Reveal может быть показан ученику при следующем входе.

## 17.5 Запросить доработку

1. Submission → `Needs revision`.
2. Написать короткий комментарий.
3. Ученик видит понятную плашку `Try again`.
4. Его XP не снимается автоматически.
5. После повторной отправки статус → Submitted.

---

# 18. Leaderboard

Не делать только один рейтинг XP.

Tabs:

- XP;
- Streak;
- Speaking;
- Teamwork;
- Creativity;
- Weekly Growth.

Чтобы один сильный ученик не был всегда №1:

- weekly reset части рейтингов;
- разные категории;
- Spotlight nominations;
- Biggest Progress;
- Best Teammate;
- weekly achievements.

---

# 19. Crew Power

Общий командный прогресс.

Пример:

`13 500 / 20 000 XP`

Пороги:

- 25%;
- 50%;
- 75%;
- 100%.

Награды:

- secret content;
- Access Key;
- Drop;
- Secret Event;
- визуальный Crew Upgrade.

Когда порог достигнут:

- progress glow;
- confetti;
- unlock animation;
- Feed event.

---

# 20. Events

Примеры:

- Speak Fest;
- Mystery Night;
- Creator Showcase;
- Word Battle;
- Halloween English Party;
- Final Main Stage.

Карточка:

- title;
- date/time;
- type;
- participants;
- status;
- reward;
- countdown;
- CTA `Join / View / Completed`.

---

# 21. Feed

Feed нужен для ощущения живой social platform.

Примеры:

- «Алена получила Badge Brave Speaker»;
- «Анастасия открыла Drop»;
- «Егор получил Crew Token»;
- «Кирилл завершил Mystery Case»;
- «Команда открыла новую неделю».

Структура события:

- avatar;
- student name;
- icon;
- text;
- timestamp;
- optional asset preview.

MVP:

- без открытых комментариев;
- можно оставить только реакции или вообще без них.

---

# 22. Авторизация

## 22.1 Students

Поддержать:

- Google Login;
- VK Login.

Правильный flow:

1. admin заранее создает student profile;
2. система создает invite code/link;
3. ученик логинится через Google/VK;
4. account связывается с заранее созданным student profile;
5. повторная привязка требует admin reset.

Не создавать автоматически нового student profile при каждом OAuth login.

## 22.2 Roles

- `student`;
- `admin`.

В будущем можно добавить `teacher`, но в текущем проекте не обязательно.

---

# 23. Понятные кнопки и плашки

Каждая важная кнопка:

- icon;
- короткий label;
- hover;
- pressed;
- loading;
- disabled.

Примеры:

- ▶ `Start Mission`;
- ⚡ `Use Power Card`;
- 🔑 `Unlock`;
- 🎁 `Open Drop`;
- ✓ `Complete`;
- ✎ `Edit`;
- + `Add XP`;
- 👁 `Preview`;
- ⭐ `Give Badge`;
- 🖼 `Change Photo`;
- ↩ `Undo`.

Не использовать непонятные icon-only действия для важных операций.

---

# 24. Состояния UI

Для элементов предусмотреть:

- default;
- hover;
- focus;
- active;
- disabled;
- loading;
- success;
- error;
- locked;
- completed;
- expired;
- needs revision.

---

# 25. Анимации

## 25.1 Обязательные

- roadmap unlock;
- XP counter;
- progress fill;
- Badge reveal;
- Power Card flip;
- Access Key unlock;
- Drop shake + reveal;
- Crew Token collect;
- Sticker bounce;
- Spotlight beam;
- card hover tilt;
- completed confetti;
- weekly transition;
- subtle animated graffiti.

## 25.2 Ограничения

Не использовать:

- постоянные прыжки;
- мигание;
- одновременно 10 анимаций;
- тяжелые particles поверх всего;
- автозвук.

Анимации должны подтверждать действие, а не мешать.

---

# 26. Звуки

Опционально.

Короткие эффекты:

- XP;
- unlock;
- card flip;
- badge;
- drop;
- level up.

Обязательно:

- mute toggle;
- сохранять выбор;
- звук только после user interaction;
- default можно оставить off.

---

# 27. Дополнительные приколюшки

## 27.1 Secret hover

На некоторых doodles:

- easter egg;
- hidden sticker;
- короткая фраза.

## 27.2 Daily tiny surprise

Не обязательная homework-механика, а маленькая декоративная награда:

- quote;
- mini sticker;
- tiny XP chance;
- funny phrase.

## 27.3 Crew reaction

После completion карточки других участников могут на секунду показать:

- clap;
- fire;
- star;
- fist bump.

## 27.4 Week transition

После завершения недели:

- Ticket / главный weekly asset получает completed state;
- новая неделя подсвечивается;
- короткая сценическая transition.

## 27.5 Rare glow

Epic / Legendary asset имеет special border / particle sparkle, но не мигает постоянно.

## 27.6 Hidden cursor moments

На отдельных зонах курсор может превращаться в:

- lightning;
- key;
- mic;
- star.

---

# 28. Данные — структура сущностей

Рекомендуемые таблицы/коллекции:

```text
users
students
student_photos
seasons
weeks
missions
submissions
mission_completions
assets
student_assets
xp_transactions
crew_token_transactions
crew_goals
events
feed_events
spotlights
admin_notes
admin_audit_log
```

---

# 29. Student data model

Минимальные поля:

```text
id
name
nickname
avatar_url
avatar_focal_x
avatar_focal_y
cefr_level
is_active
linked_auth_provider
linked_auth_user_id
current_week_override
featured_badge_id
spotlight_id
admin_note
created_at
updated_at
```

Не хранить total XP как единственный источник истины — total вычислять из XP transactions или поддерживать кэш + reconciliation.

---

# 30. Student photo data model

```text
id
student_id
original_file_url
thumb_64_url
thumb_128_url
thumb_256_url
thumb_512_url
crop_x
crop_y
crop_zoom
focal_x
focal_y
mime_type
file_size
uploaded_by
created_at
updated_at
```

Желательно хранить предыдущую фотографию ограниченное время для Undo / rollback, если политика проекта это допускает.

---

# 31. Weekly Challenge data model

Поля:

```text
id
season_id
week_number
slug
title
subtitle
description
start_date
end_date
main_mission
instructions
xp_reward
secret_bonus_text
secret_bonus_xp
main_asset_type
reward_asset_id
theme
icon_url
hero_media_url
status
is_locked
created_at
updated_at
```

---

# 32. Mission Completion data model

```text
id
student_id
week_id
status
progress_percent
main_mission_complete
secret_bonus_complete
xp_earned
bonus_xp_earned
submission_id
teacher_note
completed_at
reviewed_at
reviewed_by
created_at
updated_at
```

---

# 33. Submission data model

```text
id
student_id
week_id
type
text_value
url
file_url
mime_type
status
submitted_at
reviewed_at
revision_note
created_at
updated_at
```

`type`:

- text;
- link;
- image;
- audio;
- video;
- file;
- offline.

---

# 34. Asset inventory data model

```text
student_assets
- id
- student_id
- asset_id
- quantity
- state
- earned_at
- earned_from
- used_at
- expires_at
- metadata
```

States:

- owned;
- active;
- used;
- expired;
- hidden.

---

# 35. XP transactions

Пример:

```text
id
student_id
amount
reason_code
reason_text
week_id
source_type
source_id
created_by
created_at
reversed_transaction_id
```

Нельзя просто без следа менять XP.

Если admin исправляет значение, создается correction transaction.

---

# 36. Audit log

Все важные admin actions логировать:

- photo changed;
- XP added/removed;
- mission completed;
- status changed;
- asset granted;
- asset revoked;
- week edited;
- event edited;
- student linked/unlinked;
- Spotlight set/removed.

Поля:

```text
admin_id
action
entity_type
entity_id
before_json
after_json
created_at
```

---

# 37. Preview mode

В админке всегда доступно:

`Preview as Student`

Варианты:

- View as Алена;
- View as Анастасия;
- View as Егор;
- View as Кирилл.

В preview режиме:

- никаких реальных изменений;
- заметная плашка `Preview mode`;
- можно проверить фото, карточки, награды, locked states.

---

# 38. Analytics для администратора

Нужны простые, полезные показатели:

- XP by student;
- XP by week;
- completion rate;
- pending reviews;
- missed missions;
- streak trend;
- Crew Power;
- asset distribution;
- event participation;
- who needs attention;
- weekly growth.

Не строить тяжелую BI-систему на MVP.

---

# 39. Безопасность

Обязательно:

- HTTPS;
- secure httpOnly cookies;
- OAuth tokens не хранить в localStorage;
- server-side role checks;
- CSRF protection где нужно;
- validation входных данных;
- rate limits;
- upload restrictions;
- private admin routes;
- audit log;
- database backups;
- media access control.

Так как в системе фотографии детей:

- не делать публичные профили;
- не индексировать student pages;
- не публиковать email/phone;
- не отдавать оригиналы фото в public CDN без контроля;
- admin должен уметь удалить фотографию;
- минимизировать собираемые персональные данные.

---

# 40. Responsive

## Desktop

Полная dashboard-компоновка.

## Tablet

- collapsed sidebar;
- 2 student cards per row;
- sticky current mission;
- assets horizontal scroll.

## Mobile

Отдельная логика компоновки:

- top header;
- current mission first;
- roadmap horizontal scroll;
- own profile / crew cards;
- Crew Power;
- bottom navigation.

Не пытаться уменьшить desktop dashboard целиком.

Photo upload/crop в админке должен работать и с телефона.

---

# 41. Accessibility

Несмотря на neon style:

- AA contrast для основного текста;
- статус не только цветом;
- focus states;
- keyboard navigation;
- alt text;
- aria labels;
- reduced motion;
- без unsafe flashing;
- длинный текст без сильного glow.

---

# 42. Tech stack — рекомендуемый

## Frontend

- Next.js;
- React;
- TypeScript;
- Tailwind CSS;
- Framer Motion;
- Radix UI / shadcn/ui как accessibility-база, сильно кастомизированная;
- SVG / Lottie для небольших анимаций.

## Backend

- Next.js server actions/API или Node backend;
- PostgreSQL;
- Prisma.

## Auth

- Google OAuth;
- VK OAuth;
- secure server sessions;
- role-based access.

## Media

- S3-compatible storage / Cloudinary;
- image transformations;
- CDN;
- signed/private URLs для чувствительного контента, где это уместно.

---

# 43. MVP — обязательно

## Student

- Google/VK login;
- Home;
- animated hero stage;
- roadmap 8 weeks;
- 4 student cards;
- current mission;
- XP;
- streak;
- progress;
- Crew Power;
- Leaderboard;
- Feed;
- Asset Collection;
- Events;
- Profile.

## Admin

- admin-only login;
- students CRUD;
- **upload/change/delete/crop student photo**;
- progress/status edit;
- submission review;
- XP transactions;
- asset granting;
- weeks CRUD;
- events CRUD;
- notes;
- quick drawer;
- tracker table;
- bulk actions;
- audit log;
- preview as student.

## Visual

- выбранный neon festival design;
- animated CSS/SVG hero;
- custom cursor desktop;
- animations ассетов;
- clear CTA buttons;
- responsive;
- reduced-motion fallback.

---

# 44. Phase 2

Можно добавить позже:

- reactions in Feed;
- comments;
- teacher chat;
- push notifications;
- mobile app;
- advanced analytics;
- AI speaking feedback;
- voice analysis;
- full shop/economy;
- student-created stickers;
- real-time multiplayer challenges.

---

# 45. Пример Student JSON

```json
{
  "id": "student_alena",
  "name": "Алена",
  "nickname": "alena_vibes",
  "genderPresentation": "girl",
  "cefrLevel": "B1",
  "avatarUrl": "/private-media/students/alena/avatar-256.webp",
  "avatarFocalPoint": {"x": 0.5, "y": 0.42},
  "streakCurrent": 12,
  "streakMax": 16,
  "currentWeek": 4,
  "weekProgress": 75,
  "featuredStickers": ["on_fire", "good_vibes", "smile"],
  "featuredBadge": "brave_speaker",
  "spotlight": false,
  "active": true
}
```

Примечание: `genderPresentation` не обязательно хранить как персональное поле, если оно не нужно продукту. Для дизайна текущей группы важно просто правильно использовать реальные фотографии: Алена и Анастасия — девочки, Егор и Кирилл — мальчики.

---

# 46. Пример Week JSON

```json
{
  "week": 4,
  "slug": "speak-fest",
  "title": "Speak Fest",
  "startDate": "2026-09-28",
  "endDate": "2026-10-04",
  "mission": "Говори 60 секунд на случайную тему",
  "xpReward": 300,
  "secretBonus": {
    "text": "Используй 3 новых выражения",
    "xp": 50
  },
  "assetType": "power_card",
  "status": "active",
  "theme": "neon-pink"
}
```

---

# 47. Что должно быть удобно делать каждый день преподавателю

Это ключевой критерий админки.

Преподаватель должен за 1–2 минуты уметь:

1. открыть группу;
2. увидеть, кто что сделал;
3. нажать `Complete`;
4. при необходимости добавить XP;
5. написать 1 короткую заметку;
6. выдать asset;
7. заменить фото ученика;
8. посмотреть pending submissions;
9. открыть следующую неделю;
10. проверить результат через `Preview as Student`.

Если для этих действий требуется много экранов — UX надо упрощать.

---

# 48. Acceptance Criteria

Tool считается удачным, если:

1. ученик за 5 секунд понимает текущую неделю и миссию;
2. дизайн ощущается как digital festival/social/game product;
3. все 8 ассетов визуально и функционально различаются;
4. администратор может без разработчика менять фото учеников;
5. фото можно crop/reposition/replace/delete;
6. администратор видит понятную таблицу-трекер;
7. прогресс и XP не требуют постоянного ручного пересчета;
8. XP имеет историю транзакций;
9. важные изменения имеют Undo или audit trail;
10. данные Алены, Анастасии, Егора и Кирилла не перепутаны;
11. student photos не являются публичными;
12. админка недоступна ученикам;
13. кнопки имеют понятные icons + labels;
14. анимации красивы, но не мешают;
15. mobile версия остается удобной;
16. преподаватель может обновить результаты недели за несколько минут.

---

# 49. Финальная формула продукта

**English Level Up** должен выглядеть не как учебный сайт с «наклеенной» геймификацией, а как настоящая подростковая digital-платформа, внутри которой английский встроен в игру, события и прогресс.

Формула:

> **Festival energy + social app + collectible game + clear tracker + easy admin + private student management.**

Главный принцип админки:

> **Все, что преподаватель реально меняет в течение недели — фото, статус, прогресс, submission, XP, награды, заметки, события — должно редактироваться быстро, понятно и без участия разработчика.**
