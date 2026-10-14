export type Rate = {
  country: string
  currency: string
  amount: number
  code: string
  rate: number
}

export type RatesSnapshot = {
  date: string
  rates: Rate[]
}
