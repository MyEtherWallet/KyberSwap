
import React from "react"
import { connect } from "react-redux"
import { roundingNumber } from "../../utils/converter"
import * as actions from "../../actions/exchangeActions"
import { getTranslate } from 'react-localize-redux';
//import ReactTooltip from 'react-tooltip'

@connect((store, props) => {
  var rateEthUsd = store.tokens.tokens.ETH.rateUSD
  return {...props, translate: getTranslate(store.locale), rateEthUsd}
})

export default class RateBetweenToken extends React.Component {

  // resetMinRate = (e)=>{
  //   this.props.dispatch(actions.resetMinRate())
  //   //this.props.dispatch(actions.caculateAmount())
  // }

  render = () => {
    var tokenRate = this.props.isSelectToken ? <img src={require('../../../assets/img/waiting-white.svg')} /> : roundingNumber(this.props.exchangeRate.rate)
    return (
      <div class="token-compare">
        <div className="columns small-12 medium-5">
          1 {this.props.exchangeRate.sourceToken} = {tokenRate} {this.props.exchangeRate.destToken}
        </div>
        <div className="columns show-for-medium-up medium-2 seperator">|</div>
        <div className="columns small-12 medium-5">
          1 ETH = {this.props.rateEthUsd} USD
        </div>
      </div>
    )
  }
}