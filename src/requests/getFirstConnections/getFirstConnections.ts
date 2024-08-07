import linkedinApi from '../api/api'
import type { ConnectionElement } from './types'

type Response = {
  elements: ConnectionElement[]
  paging: {
    count: number
    start: number
    links: any[]
  }
}

class FirstConnectionsFetcher {
  private url: string = '/voyager/api/relationships/dash/connections'

  _getParams(start: number, count: number) {
    return {
      decorationId:
        'com.linkedin.voyager.dash.deco.web.mynetwork.ConnectionListWithProfile-15',
      count,
      q: 'search',
      sortType: 'RECENTLY_ADDED',
      start,
    }
  }

  async getFirstConnections(start: number, count: number) {
    const params = this._getParams(start, count)

    const response = await linkedinApi.get<Response>(this.url, {
      params,
    })

    return response.data.elements
  }
}

const fetcher = new FirstConnectionsFetcher()

export const getFirstConnections = fetcher.getFirstConnections.bind(fetcher)
