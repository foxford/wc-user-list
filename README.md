# &lt;user-list&gt;

`user-list` is an element for displaying a list of users with their avatars and online statuses that provides useful filtering, sorting and grouping options.

## Installation

```
npm install --save netology-group/user-list
```

## Example

HTML:
```html
<user-list
  id="list1"
  me="3"
  melead
  canblock
  withfilter
  sortby="online:desc,name:asc,blocked:desc"
  groupby="role"
></user-list>
```

You need to pass array of users for list:
 
```js
var userList1 = document.getElementById('list1')

userList1.users = [
  {
    id: 1,
    name: 'Calhoun Beer',
    avatar: 'https://robohash.org/nihilveritatisfugit.png?size=64x64&set=set1',
    online: false,
    role: 'user',
    blocked: false
  },
  {
    id: 2,
    name: 'Oneida Ivimey',
    avatar: 'https://robohash.org/quisetofficia.png?size=64x64&set=set1',
    online: false,
    role: 'user',
    blocked: true
  },
  {
    id: 3,
    name: 'Sheila MacCombe',
    avatar: 'https://robohash.org/consequaturnihildolores.png?size=64x64&set=set1',
    online: false,
    role: 'user',
    blocked: true
  }
]
```

## Using in project

To start using `user-list` you need to add next line in your project root.

```js
import '@netology-group/user-list/dist/user-list'
```

Also you need to add `webcomponents-bundle` polyfill and `custom-elements-es5-adapter` (see [webcomponentsjs](https://github.com/webcomponents/webcomponentsjs)).

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/2.0.2/webcomponents-bundle.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/2.0.2/custom-elements-es5-adapter.js"></script>
```

## Build

You may want to build your own custom `user-list`-like element. Here's how:

```js
import {
  UserList,
  withStyles,
  withFilter,
  withSort,
  withGroup
} from '@netology-group/user-list'

// custom styles
const css = `...`
// custom map of strings for grouping
const withGroupConfig = {
  mapping: {
    admin: 'Admins',
    moderator: 'Moderators',
    presenter: 'Presenters',
    user: 'Users'
  }
}

window.customElements.define('custom-user-list', withGroup(withSort(withFilter(withStyles(UserList, css))), withGroupConfig))
```

## User object

Example:

```
{
  id: 1,
  name: 'Calhoun Beer',
  avatar: 'https://robohash.org/nihilveritatisfugit.png?size=64x64&set=set1',
  online: false,
  role: 'user',
  blocked: false
}
```

| Property | Type | Required |
| --- | --- | --- |
| `id` | Number | yes |
| `name` | String | yes |
| `avatar` | String | yes |
| `online` | Boolean | no |
| `blocked` | Boolean | yes |


## API

### Attributes and properties:

| Name | Kind | Type | Description |
| --- | --- | --- | --- |
| `users` | `property` | `Array` | Array of users |
| `me` | `attribute` | `Number` | Highlight user with specified `id` |
| `melead` | `attribute` | `Boolean` | Show highlighted user on top of list |
| `canblock` | `attribute` | `Boolean` | When set, "lock" action is available |
| `withfilter` | `attribute` | `Boolean` | Show input field for filtering users by name |
| `sortby` | `attribute` | `String` | Allows to sort users in list by one or many properties with ordering |
| `groupby` | `attribute` | `String` | Allows to group users by value of specified key in [user object](#user-object) |

`sortby` format:
- attribute not set - without sorting
- `sortby="online,name,blocked"` - sort by key `online`, then by key `name` and finally by key `blocked` (default order is `desc`)
- `sortby="online,name:asc,blocked"` - sort by key `online`, then by key `name` with order `asc` and finally by key `blocked`

### Events:

| Name | Example | Description |
| --- | --- | --- |
| `toggle-user-lock` | `{detail: {id: 2}}` | Dispatched when user click on "lock" icon. `id` - id of user to witch the "lock" action was applied |
