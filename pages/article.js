import React from 'react'
import { connect } from 'react-redux';
import { compose } from 'redux';
import Link from 'next/link';

import app from '../components/App';
import { load } from '../redux/articleDetail';

export default compose(
  app(dispatch => dispatch(load('5322561282336-rumor'))),
  connect(({articleDetail}) => ({
    isLoading: articleDetail.getIn(['state', 'isLoading']),
    article: articleDetail.get('data'),
  })),
)(function Index({
  isLoading = false,
  article = null
}) {
  if(isLoading && article === null) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <Link href="/"><a>Back to list</a></Link>
      <pre>{JSON.stringify(article.toJS(), null, '  ')}</pre>
    </div>
  );
})