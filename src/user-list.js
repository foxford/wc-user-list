import { LitElement, html, classString } from '@polymer/lit-element'
import { withStyle as _ws, withStyleLink as _wslnk } from '@netology-group/wc-utils'
import { repeat } from 'lit-html/lib/repeat'
import orderBy from 'lodash/orderBy'
import groupBy from 'lodash/groupBy'

import style from './user-list.css'

export class UserListElement extends LitElement {
  static get properties () {
    return {
      users: Array,
      me: String,
      header: String
    }
  }
  _isMe (user, me) {
    return typeof user.id === 'number'
      ? user.id === Number(me)
      : user.id === me
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
          ${user.avatar
            ? html`<img class="image" src="${user.avatar}" alt="${user.name}">`
            : html`<div class="image"></div>`
          }
          ${user.online ? html`<div class="status"></div>` : null}
        </div>
        <div class$="${classString({name: true, highlighted: this._isMe(user, me)})}">
          <div>${user.name}</div>
        </div>
      </div>
    `
  }
  _renderListItem (user, props) {
    return html`
      <div class="item">
        ${this._renderUserInfo(user, props)}
      </div>
    `
  }
  _renderHeader(props) {
    const { header } = props
    return header && html`<h1 class="header">${header}</h1>`
  }
  _renderList (props) {
    const { users } = props

    return users && users.length > 0
      ? html`
        <div class="listWrapper">
          ${this._renderHeader(props)}
          <div class="list">
            ${repeat(this._selectUsers(props), (user) => this._renderListItem(user, props))}
          </div>
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

function withActions(baseClass, config) {
  return class extends baseClass {
    static get properties() {
      const props = {}

      Object.keys(config).forEach((prop) => {
        props[prop] = Boolean
      })

      return {
        ...super.properties,
        ...props
      }
    }
    _handleActionClick (eventName, data) {
      this.dispatchEvent(new CustomEvent(eventName, {detail: data}))
    }
    _renderAction (actionProperty, user, props) {
      const {
        active,
        applicable,
        eventData,
        eventName,
        hint,
        icon,
        iconActive,
        isHoveredIcon,
        isHoveredIconActive,
        isHoveredItemIcon,
        isHoveredItemIconActive,
        show
      } = config[actionProperty]

      const propertyValue = props[actionProperty]
      const isActive = active(user)
      const isApplicable = propertyValue && applicable(user)
      const hintValue = hint(user, propertyValue)
      const visible = propertyValue || show(user)

      const iconName = isActive ? iconActive : icon
      const actionClassNames = classString({action: true, applicable: isApplicable, disabled: propertyValue && !isApplicable})
      const actionStyles = `display: ${iconName ? 'flex' : 'none'};background-image: url('${iconName}');`
      const clickHandler = (event) => {
        this._handleActionClick(eventName, eventData(user))
        updateBackground(event, true)
      }

      const updateBackground = (event, isHovered) => {
        const el = event.target

        const nameIcon = isActive
          ? isHoveredIconActive && isHovered
            ? isHoveredIconActive
            : isHoveredItemIconActive
              ? isHoveredItemIconActive
              : iconActive
          : isHoveredIcon && isHovered
            ? isHoveredIcon
            : isHoveredItemIcon
              ? isHoveredItemIcon
              : icon

        el.style.backgroundImage = `url('${nameIcon}')`
        el.style.display = nameIcon ? 'flex' : 'none'
      }

      const popover = html`<div class="popover">${hintValue}</div>`

      return visible
        ? html`
          <div
            class$="${actionClassNames}"
            data-test-action$="${eventName}"
            style="${actionStyles}"
            on-click="${isApplicable ? clickHandler : null}"
            onmouseenter="${(e) => updateBackground(e, true)}"
            onmouseleave="${(e) => updateBackground(e, false)}"
          >
            ${popover}
          </div>
        `
        : null
    }
    _renderActionsList (user, props) {
      return html`
        <div class="actions">
          ${repeat(Object.keys(config), (actionProperty) => this._renderAction(actionProperty, user, props))}
        </div>
      `
    }
    _renderListItem (user, props) {
      const updateBackgroundAction = (event, isHoveredItem) => {
        const actions = event.target.querySelectorAll('.action')

        actions.forEach(a => {
          const eventName = a.getAttribute('data-test-action')
          const configItem = Object.values(config).find(c => c.eventName === eventName)
          const { active, isHoveredItemIcon, isHoveredItemIconActive, iconActive, icon } = configItem
          const isActive = active(user)

          const iconName = isHoveredItem && (isHoveredItemIconActive || isHoveredItemIcon)
            ? isActive ? isHoveredItemIconActive : isHoveredItemIcon
            : isActive ? iconActive : icon

          if (iconName) {
            a.style.display = 'flex';
            a.style.backgroundImage = `url('${iconName}')`
          } else {
            a.style.display = 'none';
          }
        })
      }

      return html`
        <div
          class="item" data-test-user-id$="${user.id}"
          onmouseenter="${(e) => updateBackgroundAction(e, true)}"
          onmouseleave="${(e) => updateBackgroundAction(e, false)}"
        >
          ${this._renderUserInfo(user, props)}
          ${this._renderActionsList(user, props)}
        </div>
      `
    }
  }
}

const withStyle = _ws(html)

const withStyleLink = _wslnk(html)

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
          <div class="listWrapper">
            ${super._renderHeader(props)}
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
          </div>
        `
      } else {
        return super._renderList(props)
      }
    }
  }
}

export const mixins = {
  withActions,
  withFilter,
  withGroup,
  withSort,
  withStyle,
  withStyleLink,
}

export const UserList = withStyle(UserListElement, style)
