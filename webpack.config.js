const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (buildMode, devServer, dirname, { masterPath, entryUnit, revision = null }) => {
  const obj = {
    mode: buildMode,
    entry: [`${__dirname}/src/m2.js`, masterPath.join('')],
    externals: {
      m2: '__M2'
    },
    output: {
      path: `${devServer ? masterPath[0] : dirname}/dist`,
      filename: 'm2.js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        entryUnit,
        inject: false,
        hash: true,
        template: masterPath.join('').replace(/\.js$/g, '.html'),
        filename: 'index.html',
        revision,
        buildMode,
        minify: {
          removeEmptyAttributes: function (attrName, tag) {
            return tag === 'script' && attrName === 'revision';
          }
        }
      })
    ]
  };

  obj.module = {
    rules: [
      {
        test: /\.jsx$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-react']
            }
          }
        ]
      }
    ]
  };

  if (buildMode === 'production') {
    obj.entry.push(`${__dirname}/src/babel-polyfill.js`);
    obj.module.rules.push({
        test: /\.m?js$/,
        use: [
          {
            loader: 'air-m2-builder2/src/webpack-strip-block.js',
            options: {
              start: '<@debug>',
              end: '</@debug>'
            }
          },
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      browsers: ['last 2 versions', 'ie >= 8']
                    }
                  }
                ]
              ]
            }
          }
        ]
      }
    );
  }

  return obj;
};
