import { writeFileSync } from 'fs';

import {AllParamsFlat} from './Param.types'

import countryAgeDistribution from '../assets/data/country_age_distribution.json'
import countryCaseCounts from '../assets/data/case_counts.json'
import severityData from '../assets/data/severityData.json'
import populationScenarios from '../assets/data/scenarios/populations'
import epidemiologicalScenarios from '../assets/data/scenarios/epidemiological'
import simulationData from '../assets/data/scenarios/simulation'
import containmentScenarios from '../assets/data/scenarios/containment'
import RKI_Landkreisdaten_Points from '../../../germany/rki-dashboard/RKI_Landkreisdaten_Points.json'

import run from './run'

const defaultParams: AllParamsFlat = {
  ...populationScenarios[0].data,
  ...epidemiologicalScenarios[1].data,
  ...simulationData
}

describe('run()', () => {
  /*
  it('should return hello world', async () => {
    const result = await run(defaultParams, severityData, countryAgeDistribution.Germany, containmentScenarios[0].data.reduction)
    expect(result).toBeObject()
  })

  it('should work for all r0', async () => {
    // Override r0 for this test
    const params = { ...defaultParams, r0: 0.85 }

    const result = await run(params, severityData, countryAgeDistribution.Germany, containmentScenarios[0].data.reduction)
    expect(result).toBeObject()
  })

  it('should work for a lot of countries', async () => {

    const countries = ["Switzerland", "Germany", "France", "Italy", "Spain", "Poland", "Romania", "Netherlands", "Belgium", "Czechia", "Greece", "Portugal", "Sweden", "Hungary", "Austria", "Bulgaria", "Denmark", "Finland", "Slovakia", "Ireland", "Croatia", "Lithuania", "Slovenia", "Latvia", "Estonia", "Cyprus", "Luxembourg", "Malta", "Canada", "United Kingdom", "United States"];
    
    const results : Record<string, any> = {};

    for(let country of countries) {
      try {
        const countryAgeDistributionWithType = countryAgeDistribution as Record<string, any>;
        const result = await run({
          ...populationScenarios.filter(p => p.name === country)[0].data,
          ...epidemiologicalScenarios[1].data,
          ...simulationData
        }, severityData, countryAgeDistributionWithType[country], containmentScenarios[3].data.reduction)
        results[country] = result;
      } catch(e) {
        console.error(e);
      }
    }
    let attributes = [...countries, 'deterministicTrajectory', 'time', 'total', 'infectious'];
    console.log(JSON.stringify(results, function (name, val) {
      if(!name) {
        return val;
      } else if(name.match(/^\d+$/)) {
        return val;
      } else if(attributes.includes(name)) {
        return val;
      } else {
        return undefined
      }
    }, "  "))
  })
  */

 it('should work for all german districts', async () => {
  const results : Record<string, any> = {
    "type": "FeatureCollection",
    "name": "RKI_Landkreisdaten_Points",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": []
  };

  const country = "Germany"
  const population = {...populationScenarios.filter(p => p.name === country)[0].data};


  for(let district of RKI_Landkreisdaten_Points.features) {
    try {
      const countryAgeDistributionWithType = countryAgeDistribution as Record<string, any>;

      population.suspectedCasesToday = district.properties.cases;
      population.cases = district.properties.cases.toString();

      const result = await run({
        ...population,
        ...epidemiologicalScenarios[1].data,
        ...simulationData
      }, severityData, countryAgeDistributionWithType[country], containmentScenarios[3].data.reduction)

      for(let simulationPoint of result.deterministicTrajectory) {
        const point : any = { "type": "Feature", "properties": {
          "Name": district.properties.GEN,
          "Inhabitans": district.properties.EWZ,
        }, "geometry": district.geometry};
        point.properties.time = new Date(simulationPoint.time)
        point.properties.infectiousTotal = simulationPoint.infectious.total
        // patients in ICU
        point.properties.intensiveTotal = simulationPoint.critical.total
        results.features.push(point);
      }
    } catch(e) {
      console.error(e);
    }
    // break;
  }
  writeFileSync("Simulated_Landkreise.geojson", JSON.stringify(results, undefined, "  "))
 })
})
