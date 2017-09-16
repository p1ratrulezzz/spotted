## spotty

Сервер для ВКонтакте Callback API.

### Установка
```sh
npm i spotted
```

### Использование
Примеры использования находятся в папке **examples**.

### API
> <details>
>   <summary>ctx.<b>call</b>(method: <i>String</i>, params: <i>Object</i>)</summary>
> 
>   Вызывает методы API ВКонтакте.
> 
>   [L21, APIClient.js](https://github.com/olnaz/spotty/blob/master/lib/APIClient.js#L21)
> </details>

> <details>
>   <summary>ctx.<b>reply</b>(text: <i>String</i>, attachments: <i>String/Array</i>, forwards: <i>String/Array</i>)</summary>
> 
>   Позволяет быстро отвечать на входящие сообщения.
> 
>   [L50, APIClient.js](https://github.com/olnaz/spotty/blob/master/lib/APIClient.js#L50)
> </details>

> <details>
>   <summary>ctx.<b>upload</b>(type: <i>String</i>, file: <i>Buffer/Stream</i>, params: <i>Object</i>)</summary>
> 
>   Позволяет загружать изображения / документы во ВКонтакте от имени сообщества..
> 
>   [L50, APIClient.js](https://github.com/olnaz/spotty/blob/master/lib/APIClient.js#L84)
> </details>

> <details>
>   <summary>spotty.<b>addCommunity</b>(community: <i>Object</i>)</summary>
> 
>   Добавляет сообщество в список обрабатываемых.  
>   Объект **community** должен содержать четыре обязательных свойства.
> 
>   | Property         | Type      | Requried  |
>   |------------------|-----------|----------:|
>   | accessToken      | String    | yes       |
>   | confirmationCode | String    | yes       |
>   | id               | Number    | yes       |
>   | secretKey        | String    | yes       |
> 
>   [L43, Application.js](https://github.com/olnaz/spotty/blob/master/lib/Application.js#L43)
> </details>

> <details>
>   <summary>spotty.<b>run</b>(args: <i>Object</i>)</summary>
> 
>   Запускает прослушивание входящих POST-запросов от ВКонтакте.  
>   Объект **args** может содержать перечисленные ниже свойства.
>   
>   | Property | Type    | Requried  | Default |
>   |----------|---------|----------:|--------:|
>   | port     | Number  | no        | 8080    |
> 
>   [L58, Application.js](https://github.com/olnaz/spotty/blob/master/lib/Application.js#L58)
> </details>
