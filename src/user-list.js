import {
  UserList,
  withStyles,
  withFilter,
  withSort,
  withGroup
} from './index'
import css from './styles.css'

window.customElements.define('user-list', withGroup(withSort(withFilter(withStyles(UserList, css)))))
