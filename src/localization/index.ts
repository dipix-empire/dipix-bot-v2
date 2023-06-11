import uk from './uk'
import ru from './ru'
import en from './en'

export = function translate(lang: string) {
  switch(lang) {
    case 'uk': return uk
    case 'ru': return ru
    default: return en
  }
}