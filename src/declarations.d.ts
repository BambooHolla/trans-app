/*
  Declaration files are how the Typescript compiler knows about the type information(or shape) of an object.
  They're what make intellisense work and make Typescript know all about your code.

  A wildcard module is declared below to allow third party libraries to be used in an app even if they don't
  provide their own type declarations.

  To learn more about using third party libraries in an Ionic app, check out the docs here:
  http://ionicframework.com/docs/v2/resources/third-party-libs/

  For more info on type definition files, check out the Typescript docs here:
  https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
*/
declare module '*';

interface AnyObject {
  [key: string]: any
}

interface CommentItem {
  userInfo: {
    userId: string,
    userName: string,
    avatarUrl: string,
  },
  publishTime: Date,//date
  content: string,
  // liker: number, 

  liker: string[],
}

interface EquityInfo {
  stockCode: string,
  name: string,
  count: number,
  id: string,
  marketInfo?: {
    marketValue: number,
    turnoverRate: number,
  }
  latestPrice: number,
  changeRate: number,
  circulationValue: number,
}

interface ResEquityInfo {
  FID_BZ: string
  FID_CPID: string
  FID_FLLB: string
  FID_FXJ: string
  FID_FXRQ: string
  FID_GQLB: string
  FID_GQMC: string
  FID_JYDW: string
  FID_JYJS: string
  FID_JYJW: string
  FID_JYXZ: string
  FID_JYZT: string
  FID_LX: string
  FID_MMXZ: string
  FID_PYDM: string
  FID_SSRQ: string
  FID_WTSX: string
  FID_WTXX: string
  FID_YXSJ: string
  FID_ZDBJ: string
  FID_ZGB: string
  FID_ZGBJ: string
  FID_ZSP: string
}

interface SectorSimpleData {
  sectorType: string,
  sectorName: string,
}

interface SectorData {
  [sectorType: string]: SectorDetail,
}

interface SectorDetail {
  sectorName: string,
  stockCodeList: string[],
}