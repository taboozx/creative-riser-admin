# AGENTS.md

## 🧠 Agent: UIOrchestrator (HomePage)

**Description**: Центральный компонент пользовательского интерфейса, отвечающий за сбор и публикацию поста. Координирует все остальные агенты.

* 🔹 Хранит глобальные состояния: `title`, `description`, `files`, `status`
* 🔹 Включает агентов: `MediaUploader`, `HashtagDropdown`
* 🔹 Формирует `FormData` и отправляет POST `/publish/`
* 🔹 Отслеживает прогресс и ошибки
* 🚫 Не валидирует данные, полагается на backend

---

## 🎥 Agent: MediaUploader

**Description**: Компонент загрузки медиафайлов с drag & drop и предпросмотром. Не загружает файлы напрямую.

* 🔹 Принимает: изображения и видео (через input и drop)
* 🔹 Показывает предпросмотр (через `URL.createObjectURL`)
* 🔹 Передаёт `files` родителю (`UIOrchestrator`) через `props.setFiles`
* 🔸 Управляет стилем drag-hover
* 🚫 Не делает запросов на сервер

---

## 🏷️ Agent: HashtagManager (HashtagDropdown)

**Description**: Компонент для вставки хэштегов из облака в описание поста.

* 🔹 Получает список тегов с backend (`GET /hashtags`)
* 🔹 Позволяет выбрать множественные теги
* 🔹 Обновляет `description` в `HomePage`
* 🚫 Не сохраняет и не валидирует теги

---

## 📦 Agent: Publisher API (FastAPI `/publish/`)

**Description**: Backend-агент, принимающий данные публикации и отправляющий их в Telegram-канал.

* 🔹 Принимает: `title`, `description`, `media[]`
* 🔹 Поддерживает одиночные и множественные файлы (через `UploadFile[]`)
* 🔹 Логирует события (`logger.info`)
* 🔸 Проверяет токен (`Depends(verify_token)`)
* 🔹 Отправляет сообщение или файлы через `client.send_message` / `client.send_file`
* 🚫 Не валидирует формат или размер файлов

---

## 🔐 Agent: AuthGuard

**Description**: Простой механизм защиты эндпоинта публикации.

* 🔹 Использует `HTTPAuthorizationCredentials`
* 🔹 Проверяет Bearer-токен
* 🔹 Применяется через `Depends(verify_token)`
* 🚫 Не проверяет роли или права доступа
