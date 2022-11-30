/**
 * @type {import('next').NextConfig}
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const withTM = require('next-transpile-modules')([
  'react-markdown',
  'remark-gfm',
]);
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const CopyPlugin = require('copy-webpack-plugin');
const API_URL = process.env.API_URL || '';

module.exports = () => {
  const config = {
    swcMinify: true,
    esModule: true,
    i18n: {
      locales: ['default'].concat(
        process.env.CONTENTFUL_LOCALES
          ? process.env.CONTENTFUL_LOCALES.split(' ')
          : ['da', 'de', 'en', 'es', 'fr', 'nl'],
      ),
      defaultLocale: 'default',
      localeDetection: false,
    },
    assetPrefix: '/web-cms-assets',
    compiler: {
      styledComponents: true,
    },
    experimental: {
      // Experimental monorepo support
      // @link {https://github.com/vercel/next.js/pull/22867|Original PR}
      // @link {https://github.com/vercel/next.js/discussions/26420|Discussion}
      externalDir: true,
    },
    typescript: {
      tsconfigPath: './tsconfig.json',
    },
    productionBrowserSourceMaps: process.env.ENABLE_SOURCEMAPS === 'true',
    async rewrites() {
      return {
        beforeFiles: [
          {
            source: '/wa/api/:path*',
            destination: `${API_URL}/wa/api/:path*`,
          },
          {
            source: '/web-cms-assets/:path*',
            destination: `/:path*`,
          },
        ],
        fallback: [
          {
            source: '/:path*',
            destination: `${API_URL}/:path*`,
          },
        ],
      };
    },
    async redirects() {
      return [
        // {
        //   source: '/fr',
        //   destination: '/fr/fr',
        //   permanent: true,
        //   locale: false,
        // },
        // {
        //   source: '/fr/nigeria',
        //   destination: '/fr/fr/nigeria',
        //   permanent: true,
        //   locale: false,
        // },
        {
          source: '/_error',
          destination: '/error_page',
          permanent: true,
        },
      ];
    },
    async headers() {
      return [
        {
          source: '/:all*(svg|jpg|png)',
          locale: false,
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=9999999999, must-revalidate',
            },
          ],
        },
      ];
    },
    webpack(config) {
      config.module.rules.push({
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        use: ['url-loader'],
      });
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: require.resolve(`@braze/service-worker`),
              to: 'static',
            },
          ],
        }),
      );
      return config;
    },
    excludeFiles: [
      '**/*.test.tsx',
      '**/*.test.ts',
      '**/*.stories.tsx',
      '**/*.mock.ts',
    ],
    images: {
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // TODO: leave sizes that we will use
      imageSizes: [16, 32, 48, 64, 96, 128, 256],
      domains: ['www.worldremit.com', 'images.ctfassets.net'],
    },
    env: {
      GIT_SHORTHASH: process.env.GIT_SHORTHASH,
      GIT_BRANCHNAME: process.env.GIT_BRANCHNAME,
      APPLICATION_DOCKER_IMAGE: process.env.APPLICATION_DOCKER_IMAGE,
    },
  };

  const plugins = [withTM, withBundleAnalyzer];

  return plugins.reduce((acc, plugin) => plugin(acc), { ...config });
};
