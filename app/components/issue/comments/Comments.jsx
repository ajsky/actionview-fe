import React, { PropTypes, Component } from 'react';
import { Button, Form, FormControl, FormGroup, ControlLabel, Col, Panel, Label } from 'react-bootstrap';
import _ from 'lodash';

const $ = require('$');
const img = require('../../../assets/images/loading.gif');
const moment = require('moment');
const DelCommentsModal = require('./DelCommentsModal');
const EditCommentsModal = require('./EditCommentsModal');

export default class Comments extends Component {
  constructor(props) {
    super(props);
    this.state = { addCommentsShow: false, editCommentsShow: false, delCommentsShow: false, selectedComments: {}, contents:  '', atWho: [] };
    this.addAtWho = this.addAtWho.bind(this);
  }

  static propTypes = {
    indexLoading: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    itemLoading: PropTypes.bool.isRequired,
    indexComments: PropTypes.func.isRequired,
    addComments: PropTypes.func.isRequired,
    editComments: PropTypes.func.isRequired,
    delComments: PropTypes.func.isRequired,
    users: PropTypes.array.isRequired,
    collection: PropTypes.array.isRequired
  }

  showCommentsInputor() {
    this.setState({ addCommentsShow: true });
  }

  showDelComments(data) {
    this.setState({ delCommentsShow: true, selectedComments: data });
  }

  showEditComments(data) {
    this.setState({ editCommentsShow: true, selectedComments: data });
  }

  async addComments() {
    const { addComments, users } = this.props;
    const newAtWho = [];
    _.map(_.uniq(this.state.atWho), (val) => {
      const user = _.find(users, { id: val });
      if (this.state.contents.indexOf('@' + user.name) !== -1) {
        newAtWho.push(val);
      }
    });
    const ecode = await addComments({ contents: this.state.contents, atWho: _.map(newAtWho, (v) => _.find(users, { id: v }) ) }); 
    if (ecode === 0) {
      this.setState({ addCommentsShow: false, contents: '', atWho: [] });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.indexLoading) {
      this.setState({ addCommentsShow: false, contents: '', atWho: [] });
    }
  }

  addAtWho(user) {
    this.state.atWho.push(user.id);
  }

  componentDidUpdate() {
    const { users } = this.props;
    const self = this;
    $('.comments-inputor textarea').atwho({
      at: '@',
      searchKey: 'nameAndEmail',
      displayTpl: '<li>${nameAndEmail}</li>',
      insertTpl: '${nameAndEmail}',
      callbacks: {
        beforeInsert: function(value, $li) {
          const user = _.find(users, { nameAndEmail: value });
          if (user) {
            self.state.atWho.push(user.id);
          }
          return '@' + user.name;
        }
      },
      data: users
    });
    $('.comments-inputor textarea').on('inserted.atwho', function(event, flag, query) {
      self.setState({ contents: event.target.value });
    });
  }

  render() {
    const { indexComments, collection, indexLoading, loading, itemLoading, delComments, editComments, users } = this.props;

    return (
      <Form horizontal>
        <FormGroup>
          <Col sm={ 12 } className={ indexLoading && 'hide' } style={ { marginTop: '10px', marginBottom: '10px' } }>
            <div>
              <span className='comments-button' style={ { marginRight: '10px', float: 'right' } } disabled={ loading } onClick={ () => { indexComments() } }><i className='fa fa-refresh'></i> 刷新</span>
              <span className='comments-button' style={ { marginRight: '10px', float: 'right' } } disabled={ loading } onClick={ this.showCommentsInputor.bind(this) }><i className='fa fa-comment-o'></i> 添加</span>
            </div>
          </Col>
          <Col sm={ 12 } className={ this.state.addCommentsShow || 'hide' }>
            <div className='comments-inputor'>
              <textarea style={ { height: '150px', width: '100%', borderColor: '#ccc', borderRadius: '4px' } } onChange={ (e) => { this.setState({ contents: e.target.value }) } } value={ this.state.contents } placeholder='输入备注'/>
            </div>
            <div style={ { textAlign: 'right', marginBottom: '10px' } }>
              <img src={ img } className={ loading ? 'loading' : 'hide' } />
              <Button style={ { marginRight: '10px', marginLeft: '10px' } } onClick={ this.addComments.bind(this) } disabled={ loading || _.isEmpty(_.trim(this.state.contents)) }>添加</Button>
              <Button style={ { marginRight: '5px' } } onClick={ () => { this.setState({ addCommentsShow: false }) } } disabled={ loading }>取消</Button>
            </div>
          </Col>
          <Col sm={ 12 }>
          { indexLoading && <div style={ { width: '100%', textAlign: 'center', marginTop: '15px' } }><img src={ img } className='loading' /></div> }
          { collection.length <= 0 && !indexLoading ?
            <div style={ { width: '100%', textAlign: 'left', marginTop: '10px', marginLeft: '10px' } }>暂无备注。</div>
            :
            _.map(collection, (val, i) => {
              const header = ( <div style={ { fontSize: '12px' } }>
                <span>{ (val.creator && val.creator.name) + ' 添加备注 - ' + (val.created_at && moment.unix(val.created_at).format('YYYY/MM/DD HH:mm')) }</span>
                <span className='comments-button comments-edit-button' style={ { float: 'right' } } onClick={ this.showDelComments.bind(this, val) }><i className='fa fa-trash' title='删除'></i></span>
                <span className='comments-button' style={ { marginRight: '10px', float: 'right' } } onClick={ this.showEditComments.bind(this, val) }><i className='fa fa-pencil' title='编辑'></i></span>
              </div> ); 
              let contents = val.contents || '-';
              _.map(val.atWho || [], (v) => {
                contents = contents.replace(eval('/@' + v.name + '/'), '<a title="' + v.nameAndEmail + '">@' + v.name + '</a>');
              });
              contents = contents.replace(/(\r\n)|(\n)/g, '<br/>'); 

              return (
                <Panel header={ header } key={ i } style={ { margin: '5px' } }>
                  <span dangerouslySetInnerHTML={ { __html: contents } }/>
                  <div style={ { marginTop: '5px', fontSize: '12px' } }><span className='comments-button'><i className='fa fa-share'></i> 回复</span></div>
                </Panel>) } ) }
          </Col>
        </FormGroup>
        { this.state.editCommentsShow &&
          <EditCommentsModal show
            close={ () => { this.setState({ editCommentsShow: false }) } }
            data={ this.state.selectedComments }
            loading = { itemLoading }
            users ={ users }
            edit={ editComments }/> }
        { this.state.delCommentsShow &&
          <DelCommentsModal show
            close={ () => { this.setState({ delCommentsShow: false }) } }
            data={ this.state.selectedComments }
            loading = { itemLoading }
            del={ delComments }/> }
      </Form>
    );
  }
}