import { LitElement, html, classString } from '@polymer/lit-element'
import { repeat } from 'lit-html/lib/repeat'
import orderBy from 'lodash/orderBy'
import groupBy from 'lodash/groupBy'

// todo: extract action mixin (canblock)

class UserList extends LitElement {
  static get properties () {
    return {
      users: Array,
      me: Number,
      canblock: Boolean
    }
  }
  _handleLockClick (userId) {
    this.dispatchEvent(new CustomEvent('toggle-user-lock', {detail: {id: userId}}))
  }
  _isMe (user, me) {
    return user.id === me
  }
  _selectUsers (props) {
    const { users } = props

    return users
  }
  _renderUserInfo (user, props) {
    const { me } = props

    return html`
      <div class="info">
        <div class="avatar">
          <img class="image" src="${user.avatar}" alt="${user.name}">
          ${user.online ? html`<div class="status"></div>` : null}
        </div>
        <div class$="${classString({name: true, highlighted: this._isMe(user, me)})}">${user.name}</div>
      </div>
    `
  }
  _renderLockAction (user, props) {
    const { me, canblock } = props

    return canblock
      ? html`
        <div
          class$="${classString({lock: true, active: user.blocked})}"
          on-click="${() => this._handleLockClick(user.id)}"
        >
          <div class="popover">${user.blocked ? 'Разблокировать' : 'Заблокировать'}</div>
        </div>
      `
      : user.blocked
        ? html`
          <div class="lock active">
            <div class="popover">${this._isMe(user, me) ? 'Вас заблокировали' : 'Заблокирован'}</div>
          </div>
        `
        : null
  }
  _renderListItem (user, props) {
    return html`
      <div class="item">
        ${this._renderUserInfo(user, props)}
        <div class="actions">
          ${this._renderLockAction(user, props)}
        </div>
      </div>
    `
  }
  _renderList (props) {
    const { users } = props

    return users && users.length > 0
      ? html`
        <div class="list">
          ${repeat(this._selectUsers(props), (user) => this._renderListItem(user, props))}
        </div>
      `
      : null
  }
  _renderWrapper (props) {
    return html`
      <div class="wrapper">
        ${this._renderList(props)}
      </div>
    `
  }
  _render (props) {
    return html`
      ${this._renderWrapper(props)}
    `
  }
}

function withStyles (baseClass, styles) {
  return class extends baseClass {
    _renderStyles () {
      return html`<style>${styles}</style>`
    }
    _render (props) {
      return html`
        ${this._renderStyles()}
        ${super._render(props)}
      `
    }
  }
}

function withStyleLink (baseClass, styleLink) {
  return class extends baseClass {
    _renderStyleLink() {
      return html`<link href$='${styleLink}' rel='stylesheet' type='text/css' />`
    }

    _render(props) {
      return html`
        ${this._renderStyleLink()}
        ${super._render(props)}
      `
    }
  }
}

function withFilter (baseClass) {
  return class extends baseClass {
    constructor () {
      super()

      this.filterValue = ''
    }
    static get properties () {
      return {
        ...super.properties,
        withfilter: Boolean
      }
    }
    _filterUsers (users, withfilter) {
      const needle = this.filterValue.trim().toLowerCase()

      return withfilter && needle !== ''
        ? users.filter((item) => item.name.toLowerCase().indexOf(needle) !== -1)
        : users
    }
    _selectUsers (props) {
      const { withfilter } = props
      const users = super._selectUsers(props)

      return this._filterUsers(users, withfilter)
    }
    _handleInputChange (value) {
      this.filterValue = value
      this.requestRender()
    }
    _renderFilter (props) {
      const { withfilter } = props

      return withfilter
        ? html`
          <div class="filter">
            <input
              type="text"
              placeholder="Найти пользователей по имени..."
              on-input="${(e) => this._handleInputChange(e.target.value)}"
              value="${this.filterValue}">
          </div>
        `
        : null
    }
    _renderWrapper (props) {
      return html`
        <div class="wrapper">
          ${this._renderFilter(props)}
          ${this._renderList(props)}
        </div>
      `
    }
  }
}

function withSort (baseClass) {
  return class extends baseClass {
    static get properties () {
      return {
        ...super.properties,
        sortby: String,
        melead: Boolean
      }
    }
    _parseSortParams (string) {
      if (!string || string === '') {
        return null
      }

      const pairs = string.split(',')
      const fields = []
      const directions = []

      pairs.forEach((pair) => {
        const [field, direction = 'desc'] = pair.split(':')

        fields.push(field)
        directions.push(direction)
      })

      return {fields, directions}
    }
    _sortUsers (users, sortby, me, melead) {
      let fields = []
      let directions = []
      const sortParams = this._parseSortParams(sortby)

      if (me && melead) {
        fields = fields.concat([(item) => this._isMe(item, me)])
        directions = directions.concat(['desc'])
      }

      if (sortParams) {
        fields = fields.concat(sortParams.fields)
        directions = directions.concat(sortParams.directions)
      }

      return fields.length && directions.length
        ? orderBy(users, fields, directions)
        : users
    }
    _selectUsers (props) {
      const { sortby, me, melead } = props
      const users = super._selectUsers(props)

      return this._sortUsers(users, sortby, me, melead)
    }
  }
}

function withGroup (baseClass, config) {
  return class extends baseClass {
    static get properties () {
      return {
        ...super.properties,
        groupby: String
      }
    }
    _groupUsers (users, groupByParam) {
      return groupBy(users, groupByParam)
    }
    _renderList (props) {
      const { groupby } = props
      const groups = groupby && groupby !== '' ? this._groupUsers(this._selectUsers(props), groupby) : null

      if (groups) {
        return html`
          <div class="list">
            ${repeat(Object.keys(groups).sort(), (key) => html`
              <div class="group">
                <div class="group-title">${config && config.mapping ? config.mapping[key] : key}</div>
                <div>
                  ${repeat(groups[key], (user) => this._renderListItem(user, props))}
                </div>
              </div>
            `)}
          </div>
        `
      } else {
        return super._renderList(props)
      }
    }
  }
}

const mixins = {
  withStyles,
  withStyleLink,
  withFilter,
  withSort,
  withGroup
}

export {
  UserList,
  mixins
}
