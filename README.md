# USA National Park Excursions

This is a travel planning app based around the United States National Parks.

## App Diagram

[View on Figma](https://www.figma.com/board/0aFhBohj24KeanH30Csd0D/CSCI-430-%E2%80%94-USA-National-Parks-Travel-Planner?node-id=0-1&t=H3pdiFYVjpLQVJQR-1)

## API Protocol

### Table of Contents

1. [Users](#user)
2. [National Parks](#national-parks)
3. [Campgrounds](#campgrounds)
4. [Things To Do](#things-to-do)
5. [Excursions](#excursions)
6. [Deprecated Endpoints](#deprecated-api-endpoints)

### User

| **Create User** ||
| --- | --- |
| method | POST |
| endpoint | /user |
| Requires Bearer Token in Auth Header | no |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| firstName | string | no | yes | between 2 and 30 characters |
|| lastName | string | no | yes | between 2 and 30 characters |
|| email | string | yes | yes | valid email |
|| password | string | no | yes | minimum length of 8 characters |
| **Response** | **Code** | **Returns** |
|| 201 Created |
|| 400 Bad Request |
|| 500 Internal Server Error |


| **Sign User In** ||
| --- | --- |
| method | POST |
| endpoint | /user/sign-in |
| Requires Bearer Token in Auth Header | no |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| email | string | yes | yes | valid email |
|| password | string | no | yes | minimum length of 8 characters |
| **Response** | **Code** | **Returns** |
|| 200 OK | { "user": User, "token": string } |
|| 400 Bad Request |
|| 401 Unauthorized | "Email has not been verified."
|| 500 Internal Server Error | "No such user"


| **Sign User Out** ||
| --- | --- |
| method | POST |
| endpoint | /user/sign-out |
| Requires Bearer Token in Auth Header | yes |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| - | - | - | - | - |
| **Response** | **Code** | **Returns** |
|| 200 OK |
|| 500 Internal Server Error |


| **Update User** ||
| --- | --- |
| method | PATCH |
| endpoint | /user/update |
| Requires Bearer Token in Auth Header | yes |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| firstName | string | no | no | between 2 and 30 characters |
|| lastName | string | no | no | between 2 and 30 characters |
|| email | string | yes | no | valid email |
|| password | string | no | no | minimum length of 8 characters |
| **Response** | **Code** | **Returns** |
|| 200 OK ||
|| 400 Bad Request ||
|| 401 Unauthorized ||
|| 500 Internal Server Error ||


| **Delete User** ||
| --- | --- |
| method | DELETE |
| endpoint | /user/delete |
| Requires Bearer Token in Auth Header | yes |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| - | - | - | - | - |
| **Response** | **Code** | **Returns** |
|| 200 OK |
|| 400 Bad Request |
|| 403 Forbidden |
|| 500 Internal Server Error |


### National Parks

| **Get National Parks** ||
| --- | --- |
| method | GET |
| endpoint | /parks |
| Requires Bearer Token in Auth Header | no |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| - | - | - | - | - |
| **Request Query String** | **Parameter** | **Required** | **Constraints** |
|| limit | no | positive integer value |
|| stateCode | no | valid 2 letter state code |
|| parkCode | no | valid 4 letter park code |
| **Response** | **Code** | **Returns** |
|| 200 OK | { national parks objects array } |
|| 400 Bad Request ||
|| 500 Internal Server Error ||




### Campgrounds

Consider updating the "/{national-park-id}" to "/{state-code}/{park-code}" OR "/{park-slug}"

| **Get Campground(s)** ||
| --- | --- |
| method | GET |
| endpoint | /{national-park-id}/campgrounds |
| Requires Bearer Token in Auth Header | no |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| - | - | - | - | - |
| **Request Query String** | **Parameter** | **Required** | **Constraints** |
|| limit | no | positive integer value |
| **Response** | **Code** | **Returns** |
|| 200 OK | { national park campgrounds objects array } |
|| 400 Bad Request ||
|| 500 Internal Server Error ||




### Things To Do

Consider updating the "/{national-park-id}" to "/{state-code}/{park-code}" OR "/{park-slug}"

| **Get Things To Do ** ||
| --- | --- |
| method | GET |
| endpoint | /{national-park-id}/thingstodo |
| Requires Bearer Token in Auth Header | no |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| - | - | - | - | - |
| **Request Query String** | **Parameter** | **Required** | **Constraints** |
|| limit | no | positive integer value |
| **Response** | **Code** | **Returns** |
|| 200 OK ||
|| 400 Bad Request ||
|| 500 Internal Server Error ||



### Excursions

Consider updating the "/{national-park-id}" to "/{state-code}/{park-code}" OR "/{park-slug}"

| **Create Excursion(s)** ||
| --- | --- |
| method | POST |
| endpoint | /{national-park-id}/excursions |
| Requires Bearer Token in Auth Header | yes |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| stateCode | string | yes | yes | valid 2 letter state code |
|| parkCode | string | yes | yes | valid 4 letter park code |
|| name | string | no | yes | between 8 and 255 characters |
|| description | string | no | yes | between 16 and 510 characters |
|| thingstodo | array of ids | no | yes | valid uuid |
| **Response** | **Code** | **Returns** |
|| 201 Created ||
|| 400 Bad Request ||
|| 401 Unauthorized ||
|| 500 Internal Server Error ||


| **Get Excursion(s)** ||
| --- | --- |
| method | GET |
| endpoint | /{national-park-id}/excursions |
| Requires Bearer Token in Auth Header | no |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| - | - | - | - | - |
| **Request Query String** | **Parameter** | **Required** | **Constraints** |
|| - | - | - | - | - |
| **Response** | **Code** | **Returns** |
|| 200 OK | { excursions objects array } |
|| 400 Bad Request ||
|| 500 Internal Server Error ||


| **Update Excursion(s)** ||
| --- | --- |
| method | PATCH |
| endpoint | /{national-park-id}/excursions |
| Requires Bearer Token in Auth Header | yes |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| - | - | - | - | - |
|| _id | string | yes | yes | valid uuid |
| **Request Query String** | **Parameter** | **Required** | **Constraints** |
|| excursionName | no | non-empty string |
| **Response** | **Code** | **Returns** |
|| 200 OK ||
|| 400 Bad Request ||
|| 401 Unauthorized ||
|| 500 Internal Server Error ||


| **Delete Excursions(s)** ||
| --- | --- |
| method | DELETE |
| endpoint | /{national-park-id}/excursions |
| Requires Bearer Token in Auth Header | yes |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| _id | string | yes | yes | valid uuid |
| **Response** | **Code** | **Returns** |
|| 200 OK ||
|| 400 Bad Request ||
|| 401 Unauthorized ||
|| 500 Internal Server Error ||


## Deprecated API Endpoints

| **Verify User Email** ||
| --- | --- |
| method | POST |
| endpoint | /user/verification |
| Requires Bearer Token in Auth Header | no |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| - | - | - | - | - |
| **Response** | **Code** | **Returns** |
|| 200 OK |
|| 400 Bad Request |
|| 500 Internal Server Error |


| **Resend Verification Email** ||
| --- | --- |
| method | GET |
| endpoint | /user/verification |
| Requires Bearer Token in Auth Header | yes |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| - | - | - | - | - |
| **Response** | **Code** | **Returns** |
|| 200 OK ||
|| 400 Bad Request ||
|| 500 Internal Server Error ||


| **Check Email Verification Status** ||
| --- | --- |
| method | GET |
| endpoint | /user/verification/status |
| Requires Bearer Token in Auth Header | yes |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| - | - | - | - | - |
| **Response** | **Code** | **Returns** |
|| 200 OK ||
|| 400 Bad Request ||
|| 401 Unauthorized ||
|| 500 Internal Server Error ||


| **Send Password Reset Email** ||
| --- | --- |
| method | GET |
| endpoint | /user/recover |
| Requires Bearer Token in Auth Header | no |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| - | - | - | - | - |
| **Response** | **Code** | **Returns** |


### Bookmarks

| **Create Bookmark(s)** ||
| --- | --- |
| method | POST |
| endpoint | /profile/bookmarks |
| Requires Bearer Token in Auth Header | yes |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| id | string | yes | yes | valid uuid |
| **Response** | **Code** | **Returns** |
|| 201 Created ||
|| 400 Bad Request ||
|| 401 Unauthorized ||
|| 500 Internal Server Error ||


| **Get Bookmark(s)** ||
| --- | --- |
| method | GET |
| endpoint | /profile/bookmarks |
| Requires Bearer Token in Auth Header | yes |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| - | - | - | - | - |
| **Response** | **Code** | **Returns** |
|| 200 OK | { bookmarks objects } |
|| 400 Bad Request ||
|| 401 Unauthorized ||
|| 500 Internal Server Error ||


| **Delete Bookmark(s)** ||
| --- | --- |
| method | DELETE |
| endpoint | /profile/bookmarks |
| Requires Bearer Token in Auth Header | yes |
| **Request Body** | **Property** | **Type** | **Unique** | **Required** | **Constraints** |
|| - | - | - | - | - |
| **Request Query String** | **Parameter** | **Required** | **Constraints** |
|| id | yes | valid uuid |
| **Response** | **Code** | **Returns** |
|| 200 OK ||
|| 400 Bad Request ||
|| 401 Unauthorized ||
|| 500 Internal Server Error ||