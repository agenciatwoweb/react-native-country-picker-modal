import { StyleSheet } from 'react-native'
import { getHeightPercent } from './ratio'

export default StyleSheet.create({
  container: {},
  modalContainer: {
    backgroundColor: 'white',
    flex: 1
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: {
    height: 48,
    width: '70%'
  },
  inputOnly: {
    marginLeft: '15%'
  },
  touchFlag: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 19
  },
  imgStyle: {
    resizeMode: 'contain',
    width: 25,
    height: 19,
    borderColor: '#eee',
    opacity: 0.8
  },
  emojiFlag: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 30,
    width: 30,
    height: 30,
    borderColor: 'transparent',
    backgroundColor: 'transparent'
  },
  itemCountry: {
    flexDirection: 'row',
    height: 46,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 6
  },
  itemCountryFlag: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '7%',
    width: '15%'
  },
  itemCountryName: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    height: 22
  },
  countryName: {
    fontSize: 20
  },
  countryCode: {
    textAlign: 'right'
  },
  scrollView: {
    flex: 1
  },
  letters: {
    marginRight: 10,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center'
  },
  letter: {
    height: 25,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  letterText: {
    textAlign: 'center',
    fontSize: getHeightPercent(2.2)
  },
  closeButton: {
    height: 48,
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeButtonImage: {
    height: 24,
    width: 24,
    resizeMode: 'contain'
  },
  root: {
    height:320,
    borderRadius: 10,
    borderColor: '#899FAF',
    borderWidth: 3,
    overflow: 'hidden',
  },
})
