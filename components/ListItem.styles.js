export const listItemStyle = `
  .item {
    display: block;
    padding: 8px 0;
    border-top: 1px solid rgba(0, 0, 0, .2);
    text-decoration: none;
    color: rgba(0, 0, 0, .88);
  }
  .item:hover {
    color: rgba(0, 0, 0, .56);
  }
  .item:first-child {
    border: 0;
  }
  .item-text {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;
