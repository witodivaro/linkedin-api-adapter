import {
  ExplicitUrlVariables,
  UrlVariables,
} from '../../utils/queryBuilder/QueryBuilder'
import linkedinApi from '../api/api'
import { GeoUrn } from '../getFirstConnections'
import {
  SearchIntent,
  SearchNetwork,
  SearchPeopleResponse,
  SearchRequestOrigin,
  SearchResultType,
  SearchedPersonEntity,
} from './types'

interface Params {
  start: number
  count: number
  keywords: string
  geoUrns?: GeoUrn[]
}

export class PeopleSearcher {
  private url: string = '/voyager/api/graphql'

  async searchPeople(searchParams: Params): Promise<SearchedPersonEntity[]> {
    const params = this._getParams(searchParams)

    const response = await linkedinApi.get<SearchPeopleResponse>(this.url, {
      params,
    })

    return this.parseResponse(response.data)
  }

  _getParams({ keywords, count, start, geoUrns }: Params) {
    const queryParams: Record<string, string[]> = {
      network: [SearchNetwork.FIRST_CONNECTIONS],
      resultType: [SearchResultType.PEOPLE],
    }

    if (geoUrns) {
      queryParams.geoUrn = geoUrns
    }

    const queryParameters = ExplicitUrlVariables.fromObject(queryParams)

    const query = UrlVariables.fromObject({
      flagshipSearchIntent: SearchIntent.SEARCH_SRP,
      queryParameters,
    })

    const variables = UrlVariables.fromObject({
      start,
      keywords,
      origin: SearchRequestOrigin.GLOBAL_SEARCH_HEADER,
      query,
    })

    return {
      queryId: 'voyagerSearchDashClusters.2e313ab8de30ca45e1c025cd0cfc6199',
      variables,
    }
  }

  parseResponse(response: SearchPeopleResponse): SearchedPersonEntity[] {
    const { elements: clusters } = response.data.searchDashClustersByAll
    const peopleCluster = clusters[1]

    const peopleAndSpam = peopleCluster.items.map(
      (item) => item.item.entityResult
    )

    const people = peopleAndSpam.filter((item): item is SearchedPersonEntity =>
      Boolean(item)
    )

    return people
  }
}

const searcher = new PeopleSearcher()

export const searchPeople = searcher.searchPeople.bind(searcher)
