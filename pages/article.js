import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';
import Head from 'next/head';
import stringSimilarity from 'string-similarity';
import { nl2br } from '../util/text';

import app from '../components/App';
import ArticleInfo from '../components/ArticleInfo';
import ArticleItem from '../components/ArticleItem';
import CurrentReplies from '../components/CurrentReplies';
import RelatedReplies from '../components/RelatedReplies';
import ReplyForm from '../components/ReplyForm';
import {
  load,
  loadAuth,
  submitReply,
  connectReply,
  updateReplyConnectionStatus,
} from '../redux/articleDetail';

import { detailStyle } from './article.styles';

function getRatingString(replyConnections) {
  const resultStrings = [];
  const { NOT_RUMOR, RUMOR } = replyConnections.reduce(
    (agg, conn) => {
      agg[conn.getIn(['reply', 'versions', 0, 'type'])] += 1;
      return agg;
    },
    { NOT_RUMOR: 0, RUMOR: 0, NOT_ARTICLE: 0, OPINIONATED: 0 }
  );

  if (RUMOR) {
    resultStrings.push(`${RUMOR} 人認為含有不實訊息`);
  }

  if (NOT_RUMOR) {
    resultStrings.push(`${NOT_RUMOR} 人認為含有真實訊息`);
  }

  return resultStrings.join('、');
}

class ArticlePage extends React.Component {
  handleConnect = ({ target: { value: replyId } }) => {
    const { dispatch, query: { id } } = this.props;
    return dispatch(connectReply(id, replyId)).then(this.scrollToReplySection);
  };

  handleSubmit = reply => {
    const { dispatch, query: { id } } = this.props;
    return dispatch(submitReply({ ...reply, articleId: id })).then(
      this.scrollToReplySection
    );
  };

  handleReplyConnectionDelete = replyConnectionId => {
    const { dispatch, query: { id } } = this.props;
    return dispatch(
      updateReplyConnectionStatus(id, replyConnectionId, 'DELETED')
    );
  };

  handleReplyConnectionRestore = replyConnectionId => {
    const { dispatch, query: { id } } = this.props;
    return dispatch(
      updateReplyConnectionStatus(id, replyConnectionId, 'NORMAL')
    ).then(this.scrollToReplySection);
  };

  scrollToReplySection = () => {
    if (!this._replySectionEl) return;
    this._replySectionEl.scrollIntoView({ behavior: 'smooth' });
  };

  getStructuredData = () => {
    const { data } = this.props;
    const article = data.get('article');
    const ratingString = getRatingString(data.get('replyConnections'));
    if (!ratingString) return null;

    // Ref: https://developers.google.com/search/docs/data-types/factcheck
    //

    return {
      '@context': 'http://schema.org',
      '@type': 'ClaimReview',
      datePublished: moment(article.get('updatedAt')).format('YYYY-MM-DD'),
      url: `https://cofacts.g0v.tw/article/${article.get('id')}`,
      itemReviewed: {
        '@type': 'CreativeWork',
        author: {
          '@type': 'Organization',
          name: 'Internet',
        },
      },
      claimReviewed: article.get('text'),
      author: {
        '@type': 'Organization',
        name: 'Cofacts editors',
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '-1',
        bestRating: '-1',
        worstRating: '-1',
        alternateName: ratingString,
      },
    };
  };

  render() {
    const { data, isLoading, isReplyLoading } = this.props;

    const article = data.get('article');
    const replyConnections = data.get('replyConnections');
    const relatedArticles = data.get('relatedArticles');
    const relatedReplies = data.get('relatedReplies');

    if (isLoading && article === null) {
      return <div>Loading...</div>;
    }

    if (article === null) {
      return <div>Article not found.</div>;
    }

    const structuredData = this.getStructuredData();

    const articleText = article.get('text', '');
    const getArticleSimilarity = relatedArticleText =>
      stringSimilarity.compareTwoStrings(articleText, relatedArticleText);

    return (
      <div className="root">
        <Head>
          <title>{article.get('text').slice(0, 15)}⋯⋯ - 文章</title>
        </Head>

        {structuredData
          ? <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData),
              }}
            />
          : ''}

        <section className="section">
          <header className="header">
            <h2>訊息原文</h2>
            <ArticleInfo article={article} />
          </header>
          <div className="message">{nl2br(article.get('text'))}</div>
        </section>

        <section
          id="current-replies"
          className="section"
          ref={replySectionEl => (this._replySectionEl = replySectionEl)}
        >
          <h2>現有回應</h2>
          <CurrentReplies
            replyConnections={replyConnections}
            disabled={isReplyLoading}
            onDelete={this.handleReplyConnectionDelete}
            onRestore={this.handleReplyConnectionRestore}
          />
        </section>

        <section className="section">
          <h2>撰寫新回應</h2>
          <ReplyForm onSubmit={this.handleSubmit} disabled={isReplyLoading} />
        </section>

        <section className="section">
          <h2>相關文章回應</h2>
          <RelatedReplies
            onConnect={this.handleConnect}
            relatedReplies={relatedReplies}
            relatedArticles={relatedArticles}
            getArticleSimilarity={getArticleSimilarity}
          />
        </section>

        {relatedArticles.size
          ? <section className="section">
              <h2>你可能也會對這些類似文章有興趣</h2>
              <div>
                {relatedArticles.map(article =>
                  <ArticleItem key={article.get('id')} article={article} />
                )}
              </div>
            </section>
          : ''}

        <style jsx>{detailStyle}</style>
      </div>
    );
  }
}

function initFn(dispatch, { query: { id } }) {
  return dispatch(load(id));
}
function bootstrapFn(dispatch, { query: { id } }) {
  return dispatch(loadAuth(id));
}

function mapStateToProps({ articleDetail }) {
  return {
    isLoading: articleDetail.getIn(['state', 'isLoading']),
    isReplyLoading: articleDetail.getIn(['state', 'isReplyLoading']),
    data: articleDetail.get('data'),
  };
}

export default compose(app(initFn, bootstrapFn), connect(mapStateToProps))(
  ArticlePage
);
