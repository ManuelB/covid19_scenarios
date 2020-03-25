import { writeFileSync } from 'fs';
import moment from 'moment'

import {AllParamsFlat, SimulationData} from './Param.types'

import countryAgeDistribution from '../assets/data/country_age_distribution.json'
import countryCaseCounts from '../assets/data/case_counts.json'
import severityData from '../assets/data/severityData.json'
import populationScenarios from '../assets/data/scenarios/populations'
import epidemiologicalScenarios from '../assets/data/scenarios/epidemiological'
import simulationData from '../assets/data/scenarios/simulation'
import containmentScenarios from '../assets/data/scenarios/containment'
import RKI_Landkreisdaten_Points from '../../../germany/kreise_with_covid19_and_hospital_count.json'
import RKI_Landkreise_Intensivbetten from '../../../germany/Intensivbetten/RKI_Landkreise_Intensivbetten.json'
import Germany_Kreis_Population from '../../../germany/Germany_Kreis_Population.json'


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
  

 it('should work for all german districts', async () => {
  

  const country = "Germany"
  const population = {...populationScenarios.filter(p => p.name === country)[0].data};

  const mitigationStrategies : Record<string, number> = {
    "No_Mitigation": 0,
    "Strong_Mitigation": 3 
  };

  for(let mitigationStrategy in mitigationStrategies) {
    const results : Record<string, any> = {
      "type": "FeatureCollection",
      "name": "RKI_Landkreisdaten_Points",
      "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
      "features": []
    };
    for(let district of RKI_Landkreisdaten_Points.features) {
      try {
        const countryAgeDistributionWithType = countryAgeDistribution as Record<string, any>;

        
        population.populationServed = district.properties.EWZ
        population.suspectedCasesToday = district.properties.cases;
        population.cases = district.properties.cases.toString();
        population.importsPerDay = district.properties.EWZ/80000000*12.2

        const simulationDataTimeRange: SimulationData = {
          simulationTimeRange: {
            tMin: moment('2020-03-21').toDate(),
            tMax: moment('2020-03-21')
              .add(0.5, 'year')
              .toDate(),
          },
          numberStochasticRuns: 0,
        }

        const result = await run({
          ...population,
          ...epidemiologicalScenarios[1].data,
          ...simulationDataTimeRange
        }, severityData, countryAgeDistributionWithType[country], containmentScenarios[mitigationStrategies[mitigationStrategy]].data.reduction)

        // 246 beds in average in a german hospital, 23890 ICU beds and 500680 in total  
        const Hospital_ICU_Capacity = district.properties.Krankenhaeuser*246*(23890/500680)

        for(let simulationPoint of result.deterministicTrajectory) {
          const point : any = { "type": "Feature", "properties": {
            "Name": district.properties.GEN,
            "Inhabitans": district.properties.EWZ,
            "Hospital_ICU_Capacity": Hospital_ICU_Capacity,
            "Hospital_Overcapacity": simulationPoint.critical.total > Hospital_ICU_Capacity ? true : false
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
    writeFileSync("../simulation/Simulated_Landkreise_"+mitigationStrategy+".geojson", JSON.stringify(results))
  }
  */

 it('should work for RKI_Landkreise_Intensivbetten', async () => {
  

  const country = "Germany"
  const population = {...populationScenarios.filter(p => p.name === country)[0].data};

  const mitigationStrategies : Record<string, number> = {
    "Strong_Mitigation": 3 
  };

  for(let mitigationStrategy in mitigationStrategies) {
    const results : Record<string, any> = {
      "type": "FeatureCollection",
      "name": "RKI_Landkreisdaten_Points",
      "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
      "features": []
    };
    const countryAgeDistributionWithType = countryAgeDistribution as Record<string, any>;
    const Germany_Kreis_PopulationWithType = Germany_Kreis_Population as Record<string, any>;
    
    const epidemiologicalData = epidemiologicalScenarios[1].data;

    epidemiologicalData.lengthHospitalStay = 10


    for(let district of RKI_Landkreise_Intensivbetten.features) {
      try {

        
        population.populationServed = district.properties.EWZ
        population.suspectedCasesToday = district.properties.cases;
        population.cases = district.properties.cases.toString();
        population.importsPerDay = district.properties.EWZ/80000000*12.2

        const simulationDataTimeRange: SimulationData = {
          simulationTimeRange: {
            tMin: moment('2020-03-25').toDate(),
            tMax: moment('2020-03-25')
              .add(3, 'month')
              .toDate(),
          },
          numberStochasticRuns: 0,
        }

        const oAgeDistributionOfDistrict = district.properties.AGS in Germany_Kreis_PopulationWithType ? Germany_Kreis_PopulationWithType[district.properties.AGS] : countryAgeDistributionWithType[country]

        const result = await run({
          ...population,
          ...epidemiologicalData,
          ...simulationDataTimeRange
        }, severityData, oAgeDistributionOfDistrict, containmentScenarios[mitigationStrategies[mitigationStrategy]].data.reduction)

        const Hospital_ICU_Capacity = parseInt(district.properties.ALL_2017_ITS_Betten_Intensivbetten)*0.2

        for(let simulationPoint of result.deterministicTrajectory) {
          const point : any = { "type": "Feature", "properties": {
            "Name": district.properties.GEN,
            "Inhabitans": district.properties.EWZ,
            "Hospital_ICU_Capacity_Total" :parseInt(district.properties.ALL_2017_ITS_Betten_Intensivbetten),
            "Hospital_ICU_Capacity": Hospital_ICU_Capacity,
            "Hospital_Overcapacity": Hospital_ICU_Capacity+0.5 < simulationPoint.critical.total ? true : false
          }, "geometry": district.geometry};
          point.properties.time = new Date(simulationPoint.time)
          point.properties.infectiousTotal = simulationPoint.infectious.total
          point.properties.deadTotal = simulationPoint.dead.total
          point.properties.hospitalizedTotal = simulationPoint.hospitalized
          
          // patients in ICU
          point.properties.intensiveTotal = simulationPoint.critical.total
          results.features.push(point);
        }
      } catch(e) {
        console.error(e);
      }
      // break;
    }
    writeFileSync("../simulation/2020-03-25-RP-NW-SN-MV_Landkreise_Intensivbetten_"+mitigationStrategy+"-3-month.geojson", JSON.stringify(results))
  }
 })
})
