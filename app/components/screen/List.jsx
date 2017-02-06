import React, { PropTypes, Component } from 'react';
// import { Link } from 'react-router';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Button, DropdownButton, MenuItem, Label } from 'react-bootstrap';
import _ from 'lodash';

const EditModal = require('./EditModal');
const CopyModal = require('./CopyModal');
const DelNotify = require('./DelNotify');
const LayoutConfigModal = require('./LayoutConfigModal');
const LayoutFieldConfigModal = require('./LayoutFieldConfigModal');
const img = require('../../assets/images/loading.gif');

export default class List extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      editModalShow: false, 
      copyModalShow: false, 
      delNotifyShow: false, 
      layoutConfigShow: false, 
      layoutFieldConfigShow: false, 
      operateShow: false,
      hoverRowId: ''
    };
    this.editModalClose = this.editModalClose.bind(this);
    this.copyModalClose = this.copyModalClose.bind(this);
    this.delNotifyClose = this.delNotifyClose.bind(this);
    this.layoutConfigClose = this.layoutConfigClose.bind(this);
    this.layoutFieldConfigClose = this.layoutFieldConfigClose.bind(this);
  }

  static propTypes = {
    collection: PropTypes.array.isRequired,
    selectedItem: PropTypes.object.isRequired,
    options: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    itemLoading: PropTypes.bool.isRequired,
    indexLoading: PropTypes.bool.isRequired,
    index: PropTypes.func.isRequired,
    show: PropTypes.func.isRequired,
    edit: PropTypes.func.isRequired,
    config: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired,
    del: PropTypes.func.isRequired
  }

  componentWillMount() {
    const { index } = this.props;
    index();
  }

  editModalClose() {
    this.setState({ editModalShow: false });
  }

  copyModalClose() {
    this.setState({ copyModalShow: false });
  }

  delNotifyClose() {
    this.setState({ delNotifyShow: false });
  }

  layoutConfigClose() {
    this.setState({ layoutConfigShow: false });
  }

  layoutFieldConfigClose() {
    this.setState({ layoutFieldConfigShow: false });
  }

  operateSelect(eventKey) {
    const { hoverRowId } = this.state;
    const { show } = this.props;

    show(hoverRowId);
    eventKey === '1' && this.setState({ editModalShow: true });
    eventKey === '2' && this.setState({ delNotifyShow : true });
    eventKey === '3' && this.setState({ layoutConfigShow: true });
    eventKey === '4' && this.setState({ layoutFieldConfigShow: true });
    eventKey === '5' && this.setState({ copyModalShow: true });
  }

  onRowMouseOver(rowData) {
    this.setState({ operateShow: true, hoverRowId: rowData.id });
  }

  onMouseLeave() {
    this.setState({ operateShow: false, hoverRowId: '' });
  }

  render() {
    const { collection, selectedItem, options, loading, indexLoading, itemLoading, del, edit, create } = this.props;
    const { operateShow, hoverRowId } = this.state;

    const node = ( <span><i className='fa fa-cog'></i></span> );

    const screens = [];
    const screenNum = collection.length;
    for (let i = 0; i < screenNum; i++) {
      screens.push({
        id: collection[i].id,
        name:  (
          <div>
            <span className='table-td-title'>{ collection[i].name }{ collection[i].category && <span style={ { fontWeight: 'normal' } }> (全局)</span> }</span>
            { collection[i].description && <span className='table-td-desc'>{ collection[i].description }</span> }
          </div>
        ),
        workflow: ( 
          <ul style={ { marginBottom: '0px', paddingLeft: '0px', listStyle: 'none' } }>
            { _.isEmpty(collection[i].workflows) ? '-' : _.map(collection[i].workflows, function(v, i) { return (<li key={ i }>{ v.name }</li>) }) }
          </ul> ),
        operation: (
          <div>
            { operateShow && hoverRowId === collection[i].id && !itemLoading &&
              <DropdownButton pullRight bsStyle='link' style={ { textDecoration: 'blink' ,color: '#000' } } title={ node } key={ i } id={ `dropdown-basic-${i}` } onSelect={ this.operateSelect.bind(this) }>
                <MenuItem eventKey='3'>界面配置</MenuItem>
                <MenuItem eventKey='4'>字段配置</MenuItem>
                <MenuItem eventKey='5'>复制</MenuItem>
                <MenuItem eventKey='1'>编辑</MenuItem>
                <MenuItem eventKey='2'>删除</MenuItem>
              </DropdownButton>
            }
            <img src={ img } className={ itemLoading && selectedItem.id === collection[i].id ? 'loading' : 'hide' }/>
          </div>
        )
      });
    }

    const opts = {};
    if (indexLoading) {
      opts.noDataText = ( <div><img src={ img } className='loading'/></div> );
    } else {
      opts.noDataText = '暂无数据显示。'; 
    } 

    opts.onRowMouseOver = this.onRowMouseOver.bind(this);
    opts.onMouseLeave = this.onMouseLeave.bind(this);

    return (
      <div>
        <BootstrapTable data={ screens } bordered={ false } hover options={ opts } trClassName='tr-top'>
          <TableHeaderColumn dataField='id' isKey hidden>ID</TableHeaderColumn>
          <TableHeaderColumn dataField='name' >名称</TableHeaderColumn>
          <TableHeaderColumn dataField='workflow'>应用工作流</TableHeaderColumn>
          <TableHeaderColumn width='60' dataField='operation'/>
        </BootstrapTable>
        { this.state.editModalShow && <EditModal show close={ this.editModalClose } edit={ edit } data={ selectedItem }/> }
        { this.state.copyModalShow && <CopyModal show close={ this.copyModalClose } copy={ create } data={ selectedItem }/> }
        { this.state.delNotifyShow && <DelNotify show close={ this.delNotifyClose } data={ selectedItem } del={ del }/> }
        { this.state.layoutConfigShow && <LayoutConfigModal show close={ this.layoutConfigClose } data={ selectedItem } config={ edit } options= { options } loading={ loading }/> }
        { this.state.layoutFieldConfigShow && <LayoutFieldConfigModal show close={ this.layoutFieldConfigClose } data={ selectedItem } config={ edit } loading={ loading }/> }
      </div>
    );
  }
}
