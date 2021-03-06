import { writeFileSync } from 'fs';
import moment from 'moment'

import {AllParamsFlat, SimulationData, ContainmentData} from './Param.types'
import { makeTimeSeries } from './TimeSeries'


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
import Counties_Corona_Inhabitans_ICU from '../../../usa/Counties_Corona_Inhabitans_ICU.json'


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
    "Custom_Mitigation": 99 
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

    // epidemiologicalData.lengthHospitalStay = 10

    let sDate = '2020-04-03'

    const simulationDataTimeRange: SimulationData = {
      simulationTimeRange: {
        tMin: moment(sDate).toDate(),
        tMax: moment(sDate)
          .add(6, 'month')
          .toDate(),
      },
      numberStochasticRuns: 0,
    }

    // modified strong mitigation
    let oMitgationStrategy : ContainmentData = {reduction: makeTimeSeries(simulationData.simulationTimeRange, [0.4, 0.6, 0.8, 1, 1, 1])};

    for(let district of RKI_Landkreise_Intensivbetten.features) {
      try {

        
        population.populationServed = district.properties.EWZ;
        population.suspectedCasesToday = district.properties.cases*0.7;
        population.cases = (district.properties.cases*0.7).toString();
        population.importsPerDay = district.properties.EWZ/80000000*12.2


        const oAgeDistributionOfDistrict = district.properties.RS in Germany_Kreis_PopulationWithType ? Germany_Kreis_PopulationWithType[district.properties.RS] : countryAgeDistributionWithType[country]

        const result = await run({
          ...population,
          ...epidemiologicalData,
          ...simulationDataTimeRange
        }, severityData, oAgeDistributionOfDistrict, oMitgationStrategy.reduction)

        // if we have data for ICU beds use it, if not estimated based on german average of 29.2 beds per 100.000 inhabitans
        const Hospital_ICU_Capacity_Total = "ALL_2017_ITS_Betten_Intensivbetten" in district.properties && district.properties.ALL_2017_ITS_Betten_Intensivbetten !== null ? parseInt(district.properties.ALL_2017_ITS_Betten_Intensivbetten)*0.5 : ("EWZ" in district.properties && district.properties.EWZ > 0 ? district.properties.EWZ/100000*29.2 : 0);
        const Hospital_ICU_Capacity_Reserved_Covid_19 = Hospital_ICU_Capacity_Total * 0.5;

        for(let simulationPoint of result.deterministicTrajectory) {
          const point : any = { "type": "Feature", "properties": {
            "Name": district.properties.GEN,
            "Inhabitans": district.properties.EWZ,
            "Hospital_ICU_Capacity_Total" : Hospital_ICU_Capacity_Total || 0,
            "Hospital_ICU_Capacity_Reserved_Covid_19": Hospital_ICU_Capacity_Reserved_Covid_19 || 0,
            "Hospital_Overcapacity": (Hospital_ICU_Capacity_Reserved_Covid_19 || 0)+0.5 < simulationPoint.critical.total ? true : false
          }, "geometry": district.geometry};
          point.properties.time = new Date(simulationPoint.time)
          point.properties.infectiousTotal = simulationPoint.infectious.total
          point.properties.deadTotal = simulationPoint.dead.total
          
          // patients in ICU
          point.properties.intensiveTotal = simulationPoint.critical.total
          results.features.push(point);
        }
      } catch(e) {
        console.error(e);
      }
      // break;
    }
    writeFileSync("../simulation/"+sDate+"_Landkreise_Intensivbetten_"+mitigationStrategy+"-6-month.geojson", JSON.stringify(results))
  }
  
 /*
 it('should work for Counties_Corona_Inhabitans_ICU.json', async () => {
  

  const country = "United States"
  const population = {...populationScenarios.filter(p => p.name === country)[0].data};

  const mitigationStrategies : Record<string, number> = {
    "Strong_Mitigation": 0 
  };

  for(let mitigationStrategy in mitigationStrategies) {
    const results : Record<string, any> = {
      "type": "FeatureCollection",
      "name": "Counties_Corona_Inhabitans_ICU",
      "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
      "features": []
    };
    
    const epidemiologicalData = epidemiologicalScenarios[1].data;

    let sDate = '2020-04-01'

    const simulationDataTimeRange: SimulationData = {
      simulationTimeRange: {
        tMin: moment(sDate).toDate(),
        tMax: moment(sDate)
          .add(1, 'month')
          .toDate(),
      },
      numberStochasticRuns: 0,
    }

    const countryAgeDistributionWithType = countryAgeDistribution as Record<string, any>;
    const oAgeDistributionOfDistrict = countryAgeDistributionWithType[country]

    for(let district of Counties_Corona_Inhabitans_ICU.features) {
      try {

        if(district.properties["USA-Inhabitans-By-County_Inhabitants"] == null) {
          continue;
        }
        population.populationServed = parseInt(district.properties["USA-Inhabitans-By-County_Inhabitants"].replace(",", ""));
        population.suspectedCasesToday = district.properties.Confirmed;
        population.cases = district.properties.Confirmed.toString();
        population.importsPerDay = population.populationServed/327000000*20



        const result = await run({
          ...population,
          ...epidemiologicalData,
          ...simulationDataTimeRange
        }, severityData, oAgeDistributionOfDistrict, containmentScenarios[mitigationStrategies[mitigationStrategy]].data.reduction)

        // if we have data for ICU beds use it, if not estimated based on german average of 29.2 beds per 100.000 inhabitans
        const Hospital_ICU_Capacity_Total = "ITS-Beds-On-State_ICU_per_10000" in district.properties && district.properties["ITS-Beds-On-State_ICU_per_10000"] != null  ? parseFloat(district.properties["ITS-Beds-On-State_ICU_per_10000"])*population.populationServed/10000*0.5 : population.populationServed/10000*3.6;
        const Hospital_ICU_Capacity_Reserved_Covid_19 = Hospital_ICU_Capacity_Total * 0.5;

        for(let simulationPoint of result.deterministicTrajectory) {
          const point : any = { "type": "Feature", "properties": {
            "Name": district.properties.Combined_Key,
            "Inhabitans": district.properties["USA-Inhabitans-By-County_Inhabitants"],
            "Hospital_ICU_Capacity_Total" : Hospital_ICU_Capacity_Total,
            "Hospital_ICU_Capacity_Reserved_Covid_19": Hospital_ICU_Capacity_Reserved_Covid_19,
            "Hospital_Overcapacity": Hospital_ICU_Capacity_Reserved_Covid_19+0.5 < simulationPoint.critical.total ? true : false
          }, "geometry": district.geometry};
          point.properties.time = new Date(simulationPoint.time);
          point.properties.infectiousTotal = simulationPoint.infectious.total < 0.1 ? 0 : simulationPoint.infectious.total;
          point.properties.deadTotal = simulationPoint.dead.total < 0.1 ? 0 : simulationPoint.dead.total;
          
          // patients in ICU
          point.properties.intensiveTotal = simulationPoint.critical.total < 0.1 ? 0 : simulationPoint.critical.total;
          results.features.push(point);
        }
      } catch(e) {
        console.error(e);
      }
      // break;
    }
    writeFileSync("../simulation/usa/"+sDate+"_Landkreise_Intensivbetten_"+mitigationStrategy+"-1-month.geojson", JSON.stringify(results))
  }*/
 })
})
