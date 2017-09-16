# spotty

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
>   <sub>[L21, APIClient.js](https://github.com/olnaz/spotty/blob/master/lib/APIClient.js#L21)</sub>
> </details>

> <details>
>   <summary>ctx.<b>reply</b>(text: <i>String</i>, attachments: <i>String/Array</i>, forwards: <i>String/Array</i>)</summary>
> 
>   Позволяет быстро отвечать на входящие сообщения.  
>   <sub>[L50, APIClient.js](https://github.com/olnaz/spotty/blob/master/lib/APIClient.js#L50)</sub>
> </details>

> <details>
>   <summary>ctx.<b>upload</b>(type: <i>String</i>, file: <i>Buffer/Stream</i>, params: <i>Object</i>)</summary>
> 
>   Позволяет загружать изображения / документы во ВКонтакте от имени сообщества.  
>   <sub>[L84, APIClient.js](https://github.com/olnaz/spotty/blob/master/lib/APIClient.js#L84)</sub>
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
>   <sub>[L43, Application.js](https://github.com/olnaz/spotty/blob/master/lib/Application.js#L43)</sub>
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
>   <sub>[L58, Application.js](https://github.com/olnaz/spotty/blob/master/lib/Application.js#L58)</sub>
> </details>
