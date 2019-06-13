import React from "react"
import { connect } from "react-redux"
import { push } from 'react-router-redux'
import { DropFile } from "../../components/ImportAccount"
import { importNewAccount, throwError } from "../../actions/accountActions"
import { verifyKey, anyErrors } from "../../utils/validators"
import { addressFromKey, unlock } from "../../utils/keys"
import { getTranslate } from 'react-localize-redux'

import { Modal } from "../../components/CommonElement"

@connect((store, props) => {
  var tokens = store.tokens.tokens
  var supportTokens = []
  Object.keys(tokens).forEach((key) => {
    supportTokens.push(tokens[key])
  })
  return {
    account: store.account,
    ethereum: store.connection.ethereum,
    tokens: supportTokens,
    translate: getTranslate(store.locale),
    screen: props.screen,
    analytics: store.global.analytics
  }
})

export default class ImportKeystore extends React.Component {

  constructor() {
    super()
    this.state = {
      isOpen: false,
      error: "",
      keystring: ""
    }
  }

  closeModal = () => {
    this.setState({ isOpen: false, error: "" })
  }

  toggleShowPw = () => {
    let input = document.getElementById('keystore-pass')
    if (input.classList.contains('security')) {
      input.classList.remove('security')
      input.parentElement.classList.add('unlock')
    } else if (input.type == 'text') {
      input.classList.add('security')
      input.parentElement.classList.remove('unlock')
    }
  }

  unLock = () => {
    var password = document.getElementById("keystore-pass").value
    try{
      var privKey = unlock(this.state.keystring, password, true)
       
      var address = addressFromKey(this.state.keystring)
      this.props.dispatch(importNewAccount(address,
        "privateKey",
        privKey.toString("hex"),
        this.props.ethereum,
        this.props.tokens, null, null, "Keystore"))
        this.setState({ isOpen: false, error: "" })
    }catch(e){
      console.log(e)
      this.setState({ error: e.toString() })
    }
  }

  submit =(e) => {
    if (e.key === 'Enter') {
      this.unLock(e)
    }
  }


  content = () => {
    return (
      <div className="keystore-modal">
        <div className="title">{this.props.translate("modal.keystore_title") || "Type password to unlock your keystore"}</div>
        <a className="x" onClick={this.closeModal}>&times;</a>
        <div className="content with-overlap">
          <div className="row">

          <div className="input-reveal">
            <input className="text-center security" id="keystore-pass" type="text"
              autoComplete="off" spellCheck="false"
                autoFocus onKeyPress={(e) => this.submit(e)} />
            <a className="toggle" onClick={() => this.toggleShowPw()}></a>
            <a className="tootip"></a>
          </div>

            <div>
              {/* <input type="password" id="keystore-pass" /> */}
              {this.state.error && (
                  <div className={'modal-error custom-scroll'}>
                   {this.state.error}
                 </div>                
              )}
            </div>

          </div>
        </div>
        <div className="overlap">
          <div className="input-confirm grid-x input-confirm--approve">
            <div className="cell unlock-btn-wrapper">
              <a className={"button process-submit next"} onClick={this.unLock}>{this.props.translate("modal.unlock") || "Unlock"}</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  lowerCaseKey = (keystring) => {
    return keystring.toLowerCase()
  }

  goToExchange = () => {
    this.props.dispatch(push('/exchange'));
  }

  onDrop = (files) => {
    this.props.analytics.callTrack("trackClickImportAccount", "keystore");
    try {
      var _this = this
      var file = files[0]
      var fileReader = new FileReader()
      fileReader.onload = (event) => {
        var keystring = this.lowerCaseKey(event.target.result)
        var errors = {}
        errors["keyError"] = verifyKey(keystring)
        if (anyErrors(errors)) {
          this.props.dispatch(throwError(this.props.translate("error.invalid_json_file") || "Your uploaded JSON file is invalid. Please upload a correct JSON keystore."))
        } else {
          this.setState({
            isOpen: true,
            keystring: keystring
          })
        }

      }
      fileReader.readAsText(file)
    } catch (e) {
      console.log(e)
    }

  }

  render() {
    return (
      <div>
        <DropFile id="import_json"
          error={this.props.account.error}
          onDrop={this.onDrop}
          translate={this.props.translate}
        />
        <Modal className={{
          base: 'reveal tiny confirm-modal',
          afterOpen: 'reveal tiny confirm-modal'
        }}
          isOpen={this.state.isOpen}
          onRequestClose={this.closeModal}
          contentLabel="keystore modal"
          content={this.content()}
          size="medium"
        />
      </div>
    )
  }
}
