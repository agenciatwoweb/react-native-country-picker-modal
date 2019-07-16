// @flow
/* eslint import/newline-after-import: 0 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-native-modal';

import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  TextInput,
  SectionList,
  ScrollView,
  Platform,

} from 'react-native'

import Fuse from 'fuse.js'

import cca2List from '../data/cca2.json'
import { getHeightPercent } from './ratio'
import countryPickerStyles from './CountryPicker.style'

let countries = null
let Emoji = null
let styles = {}

let isEmojiable = Platform.OS === 'ios'

const FLAG_TYPES = {
  flat: 'flat',
  emoji: 'emoji'
}

const setCountries = flagType => {
  if (typeof flagType !== 'undefined') {
    isEmojiable = flagType === FLAG_TYPES.emoji
  }

  if (isEmojiable) {
    countries = require('../data/countries-emoji.json')
    Emoji = require('./emoji').default
  } else {
    countries = require('../data/countries.json')
    Emoji = <View />
  }
}


setCountries()

export const getAllCountries = () =>
  cca2List.map(cca2 => ({ ...countries[cca2], cca2 }))

export default class CountryPicker extends Component {
  static propTypes = {
    cca2: PropTypes.string.isRequired,
    translation: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func,
    closeable: PropTypes.bool,
    filterable: PropTypes.bool,
    children: PropTypes.node,
    countryList: PropTypes.array,
    excludeCountries: PropTypes.array,
    styles: PropTypes.object,
    filterPlaceholder: PropTypes.string,
    autoFocusFilter: PropTypes.bool,
    recommendedCountryList: PropTypes.array,
    // to provide a functionality to disable/enable the onPress of Country Picker.
    disabled: PropTypes.bool,
    filterPlaceholderTextColor: PropTypes.string,
    closeButtonImage: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    transparent: PropTypes.bool,
    animationType: PropTypes.oneOf(['slide', 'fade', 'none']),
    flagType: PropTypes.oneOf(Object.values(FLAG_TYPES)),
    hideAlphabetFilter: PropTypes.bool,
    renderFilter: PropTypes.func,
    showCallingCode: PropTypes.bool,
    filterOptions: PropTypes.object,
    backgroundModalColor: PropTypes.string,
    childrenWithFlag: PropTypes.node,
    recommendedSectionTitle: PropTypes.string,
    restOfTheWorldTitle: PropTypes.string,
  }

  static defaultProps = {
    translation: 'eng',
    countryList: cca2List,
    excludeCountries: [],
    filterPlaceholder: 'Filter',
    autoFocusFilter: true,
    transparent: true,
    animationType: 'none',
    backgroundModalColor: 'white',
    recommendedSectionTitle: 'ME DE UM TITULO',
    restOfTheWorldTitle: 'ME DE UM TITUTLO TBEM',
  }

  static renderEmojiFlag(cca2, emojiStyle) {
    return (
      <Text style={[countryPickerStyles.emojiFlag, emojiStyle]} allowFontScaling={false}>
        {cca2 !== '' && countries[cca2.toUpperCase()] ? (
          <Emoji name={countries[cca2.toUpperCase()].flag} />
        ) : null}
      </Text>
    )
  }

  renderSectionHeader = (item) =>{
    return(
      <View style={{marginBottom: 10, backgroundColor: 'white', height: 60, alignItems: 'center', justifyContent: 'center'}}>
        <Text style={{textAlign: 'center',fontSize: 26, fontWeight:'bold', color: '#008AFF' }}>{item}</Text>
      </View>
    );
  }

  static keyExtractor = (item) => {
    return item;
  }

  static renderImageFlag(cca2, imageStyle) {
    return cca2 !== '' ? (
      <Image
        style={[countryPickerStyles.imgStyle, imageStyle]}
        source={{ uri: countries[cca2].flag }}
      />
    ) : null
  }

  static renderFlag(cca2, itemStyle, emojiStyle, imageStyle) {
    return (
      <View style={[countryPickerStyles.itemCountryFlag, itemStyle]}>
        {isEmojiable
          ? CountryPicker.renderEmojiFlag(cca2, emojiStyle)
          : CountryPicker.renderImageFlag(cca2, imageStyle)}
      </View>
    )
  }

  constructor(props) {
    super(props)
    this.openModal = this.openModal.bind(this)

    setCountries(props.flagType)
    let countryList = [...props.countryList]
    let recommendedCountries = []
    const recommendedCountryList = [...props.recommendedCountryList]

    recommendedCountryList.forEach(recommendedCountry => {
      const index = countryList.indexOf(recommendedCountry)

      if (index !== -1) {
        recommendedCountries.push(countryList[index]);
        countryList.splice(index, 1);
      }
    })

    // Sort country list
    countryList = countryList
      .map(c => [c, this.getCountryName(countries[c])])
      .map(c => c[0])

    this.state = {
      modalVisible: false,
      recommendedCountries,
      countryList,
      cca2List: countryList,
      filter: '',
      letters: this.getLetters(countryList)
    }

    if (this.props.styles) {
      Object.keys(countryPickerStyles).forEach(key => {
        styles[key] = StyleSheet.flatten([
          countryPickerStyles[key],
          this.props.styles[key]
        ])
      })
      styles = StyleSheet.create(styles)
    } else {
      styles = countryPickerStyles
    }

    const options = Object.assign({
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['name'],
      id: 'id'
    }, this.props.filterOptions);
    this.fuse = new Fuse(
      countryList.reduce(
        (acc, item) => [
          ...acc,
          { id: item, name: this.getCountryName(countries[item]) }
        ],
        []
      ),
      options
    )
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.countryList !== this.props.countryList) {
      this.setState({
        cca2List: nextProps.countryList,
      })
    }
  }

  onSelectCountry(cca2) {
    this.setState({
      modalVisible: false,
      filter: '',
    })

    this.props.onChange({
      cca2,
      ...countries[cca2],
      flag: undefined,
      name: this.getCountryName(countries[cca2])
    })
  }

  onClose = () => {
    this.setState({
      modalVisible: false,
      filter: '',
    })
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  getCountryName(country, optionalTranslation) {
    const translation = optionalTranslation || this.props.translation || 'eng'
    return country.name[translation] || country.name.common
  }

  setVisibleListHeight(offset) {
    this.visibleListHeight = getHeightPercent(100) - offset
  }

  getLetters(list) {
    return Object.keys(
      list.reduce(
        (acc, val) => ({
          ...acc,
          [this.getCountryName(countries[val])
            .slice(0, 1)
            .toUpperCase()]: ''
        }),
        {}
      )
    ).sort()
  }

  openModal = this.openModal.bind(this)

  // dimensions of country list and window
  itemHeight = getHeightPercent(7)
  listHeight = countries.length * this.itemHeight

  openModal() {
    this.setState({ modalVisible: true })
  }

  scrollTo(letter) {
    // find position of first country that starts with letter
    const index = this.state.cca2List
      .map(country => this.getCountryName(countries[country])[0])
      .indexOf(letter)
    if (index === -1) {
      return
    }
    let position = index * this.itemHeight

    // do not scroll past the end of the list
    if (position + this.visibleListHeight > this.listHeight) {
      position = this.listHeight - this.visibleListHeight
    }

    // scroll
    this._listView.scrollTo({
      y: position
    })
  }

  handleFilterChange = value => {
    const filteredCountries =
      value === '' ? this.state.cca2List : this.fuse.search(value)

    this._listView.scrollTo({ y: 0 })

    this.setState({
      filter: value,
    })
  }

  renderCountry = (country, index) => {
    return (
      <TouchableOpacity
        key={index}
        onPress={() => this.onSelectCountry(country)}
        activeOpacity={0.99}
      >
        {this.renderCountryDetail(country)}
      </TouchableOpacity>
    )
  }

  renderLetters(letter, index) {
    return (
      <TouchableOpacity
        key={index}
        onPress={() => this.scrollTo(letter)}
        activeOpacity={0.6}
      >
        <View style={styles.letter}>
          <Text style={styles.letterText} allowFontScaling={false}>
            {letter}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  renderCountryDetail(cca2) {
    const country = countries[cca2]
    return (
      <View style={styles.itemCountry}>
        {CountryPicker.renderFlag(cca2)}
        <View style={{...styles.itemCountryName, marginTop: isEmojiable? 6 : 0}}>
          <Text style={styles.countryName} allowFontScaling={false}>
            {this.getCountryName(country)}
            {this.props.showCallingCode &&
            country.callingCode &&
            <Text style={{color: '#737373', fontSize: 14}}>{` (+${country.callingCode})`}</Text>}
          </Text>
        </View>
      </View>
    )
  }

  renderFilter = () => {
    const {
      renderFilter,
      autoFocusFilter,
      filterPlaceholder,
      filterPlaceholderTextColor
    } = this.props

    const value = this.state.filter
    const onChange = this.handleFilterChange
    const onClose = this.onClose

    return renderFilter ? (
      renderFilter({ value, onChange, onClose })
    ) : (
      <TextInput
        autoFocus={autoFocusFilter}
        autoCorrect={false}
        placeholder={filterPlaceholder}
        placeholderTextColor={filterPlaceholderTextColor}
        style={[styles.input, !this.props.closeable && styles.inputOnly]}
        onChangeText={onChange}
        value={value}
      />
    )
  }

  render() {
    return (
      <View style={{...styles.container}}>
        <TouchableOpacity
          disabled={this.props.disabled}
          onPress={() => this.setState({ modalVisible: true })}
          activeOpacity={0.7}
        >
          {this.props.children ? (
            this.props.children
          ) : (
            <View style={{flex:1 , flexDirection:'row', alignItems:'center', justifyContent:'center', marginLeft:4, }}>
            <View
              style={[styles.touchFlag, { marginTop: isEmojiable? 0 : 6,  }]}
              >
              {CountryPicker.renderFlag(this.props.cca2,
                styles.itemCountryFlag,
                styles.emojiFlag,
                styles.imgStyle)}
            </View>
              {this.props.childrenWithFlag && <View >
                {this.props.childrenWithFlag}
              </View>}
            </View>

          )}
        </TouchableOpacity>
        <Modal
          visible={this.state.modalVisible}
          onRequestClose={() => this.setState({ modalVisible: false })}
          onBackButtonPress={() => this.setState({ modalVisible: false })}
          onBackdropPress={() => this.setState({ modalVisible: false })}
        >
          <View style={styles.root}>
            <View style={{...styles.contentContainer, backgroundColor: this.props.backgroundModalColor}}>
              <SectionList
                keyboardShouldPersistTaps="always"
                removeClippedSubviews
                keyExtractor={CountryPicker.keyExtractor}
                stickySectionHeadersEnabled={true}
                style={{backgroundColor: 'transparent'}}
                ref={listView => (this._listView = listView)}
                sections={[
                  { title: this.props.recommendedSectionTitle, data: this.state.recommendedCountries},
                  { title: this.props.restOfTheWorldTitle, data: this.state.countryList}
                ]}
                renderSectionHeader={({section: {title}}) => this.renderSectionHeader(title)}
                renderSectionFooter={() => <View style={{marginTop: 10}}/>}
                renderItem={({item, index}) => this.renderCountry(item, index)}
                initialListSize={30}
                pageSize={15}
                onLayout={({ nativeEvent: { layout: { y: offset } } }) =>
                  this.setVisibleListHeight(offset)
                }
                />
              {!this.props.hideAlphabetFilter && (
                <ScrollView
                  contentContainerStyle={styles.letters}
                  keyboardShouldPersistTaps="always"
                >
                  {this.state.filter === '' &&
                    this.state.letters.map((letter, index) =>
                    this.renderLetters(letter, index)
                    )}
                </ScrollView>
                )}
            </View>
          </View>
        </Modal>
      </View>
    )
  }
}
