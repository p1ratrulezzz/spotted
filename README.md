# spotted &middot; [![npm](https://img.shields.io/npm/v/spotted.svg)]() [![npm](https://img.shields.io/npm/dt/spotted.svg)]()

```bash
$ npm install spotted
```

Библиотека для быстрого и простого создания ботов для сообществ ВКонтакте.

Включает в себя **сервер** для обработки приходящих от ВКонтакте запросов и **клиент** для вызова методов API ВКонтакте.

**Клиент** позволяет вызывать открытые методы и методы, доступные с ключом доступа сообщества, а также загружать файлы в сообщество: обложку, документы и фотографии.

## Документация

### spotted()
* Returns [`Application`](src/Application.js)

Возвращает экземпляр класса [`Application`](src/Application.js).

### [`Application`](src/Application.js)

### app.run([options])
* `options<Object>` [Параметры](#options) запуска
* Returns `void`

Запускает сервер для обработки входящих запросов.

#### Options
Свойства объекта `options` и их значения по умолчанию.

```javascript
{
  port: 8080 // <Number> Порт
}
```

### app.setCommunity(community)
* `community<Object>` [Данные сообщества](#community)
* Returns `void`

Устанавливает данные сообщества.

#### Community
Свойства объекта `community`.

```javascript
{
  accessToken,      // <String> Ключ доступа сообщества
  confirmationCode, // <String> Код подтверждения адреса сервера из настроек сообщества
  secretKey         // <String> Секретный ключ сообщества (если используется)
}
```

### [`Client`](src/Client.js)

При установке данных сообщества ([app.setCommunity](#appsetcommunitycommunity)) экземпляр `Client` создаётся автоматически, а после хранится в переменной `app.client`.

### client.call(method[, params])
* `method<String>` Название метода
* `params<Object>` Параметры метода
* Returns `Promise<Any>`

Вызывает методы API ВКонтакте.

При этом, метод не вызывается сразу, а помещается в очередь. Методы, находящиеся в очереди, отправляются на сервер ВКонтакте «пачками» и вызываются через [`execute`](https://vk.com/dev/execute).

### client.callDirect(method[, params])
* `method<String>` Название метода
* `params<Object>` Параметры метода
* Returns `Promise<Any>`

В отличие от [`client.call`](#clientcallmethod-params) вызывает методы в обход очереди.

### client.upload(type, file[, params[, afterUploadParams]])
* `type<String>` [Тип загрузки](#Типы-загрузок)
* `file<Any>` [Файл](#file) к загрузке
* `params<Object>` Параметры запроса на получение URL для загрузки. [Подробнее](https://vk.com/dev/upload_files)
* `afterUploadParams<Object>` Параметры запроса на сохранение загруженного файла. [Подробнее](https://vk.com/dev/upload_files)
* Returns `Promise<Any>`

Выполняет загрузку файлов во ВКонтакте.  

#### Типы загрузок
* `cover` [Обложка сообщества](https://vk.com/dev/upload_files_2?f=11.%2B%D0%97%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D0%BA%D0%B0%2B%D0%BE%D0%B1%D0%BB%D0%BE%D0%B6%D0%BA%D0%B8%2B%D1%81%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D1%81%D1%82%D0%B2%D0%B0)
* `document` [Документ](https://vk.com/dev/upload_files_2?f=10.%20%D0%97%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D0%BA%D0%B0%20%D0%B4%D0%BE%D0%BA%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%BE%D0%B2) в личное сообщение
* `document_wall` Документ на стену
* `photo` [Фотография](https://vk.com/dev/upload_files?f=4.%2B%D0%97%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D0%BA%D0%B0%2B%D1%84%D0%BE%D1%82%D0%BE%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D0%B8%2B%D0%B2%2B%D0%BB%D0%B8%D1%87%D0%BD%D0%BE%D0%B5%2B%D1%81%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D0%BD%D0%B8%D0%B5) в личное сообщение

#### File
Файл должен представлять собой *FS Stream* либо объект, который содержит следующие свойства:  

| Свойство | Тип    |                  |
|----------|:-------|------------------|
| content  | Buffer | Содержимое файла |
| name     | String | Имя файла        |

#### Как загружать граффити и аудио-сообщения?
Для того, чтобы загрузить граффити или аудио-сообщение, нужно указать `document` как тип загрузки, а в параметрах запроса `params` указать тип загружаемого документа: для граффити — это `graffiti`, для аудио-сообщения — `audio_message`.

### [`Message`](src/types/Message.js)

Для событий `message_new` и `message_reply` возвращается экземпляр класса [`Message`](src/types/Message.js), который имеет расширенный список методов.

#### message.delete()
#### message.isAudio()
#### message.isAudioMessage()
#### message.isGraffiti()
#### message.isPhoto()
#### message.isSticker()
#### message.isText()
#### message.reply(answer)
* `answer<String/Object>` Сообщение-ответ
* Returns `Promise<Any>`

Позволяет быстро отправить ответ на сообщение в текущий диалог.

`answer` может быть как строкой-ответом, так и объектом, содержащим параметры для метода [`messages.send`](https://vk.com/dev/messages.send).

#### message.restore()
#### message.send()
#### message.setTyping([userId])
* `userId<Number>` ID пользователя (= ID диалога)
* Returns `Promise<Any>`

Изменяет статус набора текста сообществом в диалоге.

**userId** по умолчанию равен ID пользователя текущего сообщения.
