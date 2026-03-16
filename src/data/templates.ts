import type { TreeNode } from '../types';

// 默认空族谱模板
export const emptyTreeTemplate: TreeNode = {
  id: 'root',
  name: '始祖',
  spouse: '',
  children: []
};

// 初始族谱数据 (作为新建族谱的默认模板)
export const initialData: TreeNode = {
  id: 'root',
  name: '孙守禄',
  spouse: '元配张氏',
  children: [
    {
      id: 'node-1',
      name: '起山',
      spouse: '元配尹氏',
      children: [
        {
          id: 'node-1-1',
          name: '述先',
          spouse: '元配谢氏,继配董氏,三配李氏',
          children: [
            {
              id: 'node-1-1-1',
              name: '士凤',
              spouse: '元配谭氏',
              children: [
                {
                  id: 'node-1-1-1-1',
                  name: '楷',
                  spouse: '元配王氏',
                  children: [
                    {
                      id: 'node-1-1-1-1-1',
                      name: '怀云',
                      spouse: '元配管氏',
                      children: [{ id: 'node-hy-1', name: '继宗', spouse: '元配王氏', children: [] }]
                    },
                    {
                      id: 'node-1-1-1-1-2',
                      name: '怀成',
                      spouse: '元配段氏',
                      children: [
                        {
                          id: 'node-hc-1',
                          name: '继生',
                          spouse: '元配张氏,继配祁氏',
                          children: [
                            {
                              id: 'node-js-1', name: '振铎', spouse: '元配赵氏',
                              children: [{ id: 'node-zd-1', title: '长子', name: '好宾', children: [{ id: 'node-zd-2', title: '长子', name: '佳树', children: [{ id: 'node-zd-3', title: '长子', name: '传兴', children: [{ id: 'node-zd-4', name: '铁良', children: [] }] }] }] }]
                            },
                            {
                              id: 'node-js-2', name: '振海', spouse: '元配姜氏',
                              children: [{ id: 'node-zh-1', title: '次子', name: '好宽', children: [{ id: 'node-zh-2', title: '次子', name: '佳林', children: [{ id: 'node-zh-3', title: '次子', name: '传业', children: [{ id: 'node-zh-4', name: '浩鹏', children: [] }] }] }] }]
                            },
                            {
                              id: 'node-js-3', name: '振涛', spouse: '元配谢氏',
                              children: [{ id: 'node-zt-1', title: '三子', name: '好宝', children: [{ id: 'node-zt-2', title: '三子', name: '佳柱', children: [{ id: 'node-zt-3', title: '三子', name: '传勇', children: [{ id: 'node-zt-4', name: '博文', children: [] }] }] }] }]
                            },
                            { id: 'node-js-4', name: '建章', spouse: '入嗣振海', children: [] }
                          ]
                        }
                      ]
                    },
                    {
                      id: 'node-1-1-1-1-3',
                      name: '怀清',
                      spouse: '元配李氏',
                      children: [
                         { id: 'node-hq-1', name: '振斌', spouse: '元配王氏', children: [
                             { id: 'node-zb-1', title: '长子', name: '好端', children: [{ id: 'node-zb-1-1', title: '长子', name: '佳信', children: [{ id: 'node-zb-1-1-1', title: '长子', name: '传仁', children: [] }] }] },
                             { id: 'node-zb-2', title: '次子', name: '好经', children: [{ id: 'node-zb-2-1', title: '次子', name: '佳丽', children: [{ id: 'node-zb-2-1-1', title: '次子', name: '传义', children: [] }] }] }
                         ]}
                      ]
                    },
                    {
                      id: 'node-1-1-1-1-4',
                      name: '怀收',
                      spouse: '元配王氏',
                      children: [{ id: 'node-hs-1', name: '振刚', children: [] }]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'node-1-2',
          name: '开先',
          spouse: '元配姜氏',
          children: [
            {
              id: 'node-1-2-1',
              name: '士超',
              spouse: '元配张氏',
              children: [
                {
                  id: 'node-1-2-1-1',
                  name: '树',
                  spouse: '',
                  children: [
                     {
                         id: 'node-shu-1', name: '连孟', spouse: '元配李氏',
                         children: [
                             { id: 'node-lm-1', title: '长子', name: '效堂', children: [{id:'node-lm-1-1', title: '长子', name:'好明', children:[]}] },
                             { id: 'node-lm-2', title: '次子', name: '效明', children: [{id:'node-lm-2-1', title: '次子', name:'好清', children:[]}] },
                             { id: 'node-lm-3', title: '三子', name: '效文', children: [{id:'node-lm-3-1', title: '三子', name:'好源', children:[]}] },
                             { id: 'node-lm-4', title: '四子', name: '效武', children: [] },
                             { id: 'node-lm-5', title: '五子', name: '效汤', children: [] },
                             { id: 'node-lm-6', title: '六子', name: '效胜', children: [] }
                         ]
                     },
                     { id: 'node-shu-2', name: '连子', spouse: '元配祁氏', children: [] },
                     { id: 'node-shu-3', name: '连双', spouse: '元配马氏', children: [] }
                  ]
                },
                { id: 'node-1-2-1-2', name: '朴', spouse: '', children: [] }
              ]
            }
          ]
        }
      ]
    }
  ]
};
