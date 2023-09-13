

$(function(){
    
    let latitudeIP
    let longitudeIP

    $.ajax({
        url: `http://www.geoplugin.net/json.gp?ip`,
        type: 'GET',
        dataType: 'json'
    }).done(function(d) {
        latitudeIP = d.geoplugin_latitude
        longitudeIP = d.geoplugin_longitude
    })
    setTimeout(() => console.log(latitudeIP), 200)

// *** APIs ***
// old API -> xGPGMy7n1dTmG3ErdBUPedrGgJm2iXFf

let daysBrazilian = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sabado']

/*INFORMAÇÃO TEMPERATURA */
function info(dado) {

    let getKey = dado.Key

    //Contage Temp Each Day
    let dias = $('.dayname')
    let dataToday = new Date()
    let getDateN = dataToday.getDay()
    let ctgDate = 0

    //getTemperature
    $.ajax({
        url: `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${getKey}?apikey=yt4IZAd7OWSqytscGy5K1oAfyNzHFBGo`,
        type: 'GET',
        dataType: 'json'
    }).done(function(data) {
        const getDailyForecastsMax = data.DailyForecasts.map(d => {
            let maxTemp = d.Temperature.Maximum.Value
            return FtoCelsius(maxTemp)
        })
        
        const getDailyForecastsMin = data.DailyForecasts.map(d => {
            let minTemp = d.Temperature.Minimum.Value
            return FtoCelsius(minTemp)
        })
        
        //text html
        $('#texto_temperatura').html(`${getDailyForecastsMax[0]}ºC`)
        $('#texto_max_min').html(`${getDailyForecastsMin[0]}º / ${getDailyForecastsMax[0]}º`)
        for(let i = 0; i <= dias.length; i++) {
            $(dias[i]).html(daysBrazilian[getDateN])
            let maxMin = $('.max_min_temp')[i]
            if( typeof $(maxMin).attr('id') === 'undefined') {
                $(maxMin).html(`${getDailyForecastsMin[ctgDate]}º / ${getDailyForecastsMax[ctgDate]}º`)
                ctgDate++
            }
            getDateN++
        }
    }).fail(() => {
        console.log('erro requisição de 5days')
    })
    
    //getHoursAndTemp
    let getHoursAndTemp;
    $.ajax({
        url: `http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${getKey}?apikey=yt4IZAd7OWSqytscGy5K1oAfyNzHFBGo`,
        type: 'GET',
        dataType: 'json'
    }).done(function(data) {
        getHoursAndTemp = data.map(d => {
            let selectHours = d.DateTime
            let selectTemperatureDay = FtoCelsius(d.Temperature.Value)
            let myHours = [selectHours[11], selectHours[12]]
            //Temperature - Hour
            let arrDatesAndTemperature = [selectTemperatureDay, myHours.join('')]

            return arrDatesAndTemperature
        })
        return getHoursAndTemp
    }).fail(() => {
        console.log('erro na requisição 12horas')
    })
    setTimeout(() => graphicFunction(getHoursAndTemp), 500)
   
    $('#local').change(function() {
        let resultCity = $('#local').val()
        let resultCityUpper = resultCity.split(' ')
        resultCityUpper.forEach(r =>`${r[0].toUpperCase()}${r.slice(1)}`)

        $.ajax({
            url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${resultCityUpper}.json?access_token=pk.eyJ1Ijoia2F3bW9tbyIsImEiOiJjbG1mMGpsNjAwZTl5M29wZnhuZnpteDQzIn0.64JfxlhZagGjgwuWjQxWlQ`,
            type: 'GET',
            dataType: 'json'
        }).done(function(data) {
            let latitudePesq = data.features[0].center[1]
            let altidudePesq = data.features[0].center[0]

            latitudeIP = latitudePesq
            longitudeIP = altidudePesq
            setTimeout(() => {
                $('.refresh-loader').css('display', 'block')
                getGeo(dateState)
                getGeo(info)
            }, 250)

            setTimeout(() => $('.refresh-loader').css('display', 'none'), 750)
        }).fail(() => {
            console.log('erro na requisição buscar cidade')
        })
    })

    function FtoCelsius(t) {
        return ((t-32) / 1.8).toFixed()
    }
}

/* API LOCALIZAÇÃO VIA LOCALIZAÇÃO GEOGRAFIA */
function getGeo(cb) {
    setTimeout(() => {
        console.log(latitudeIP)
        $.ajax({
            url: `http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=yt4IZAd7OWSqytscGy5K1oAfyNzHFBGo&q=${latitudeIP}%2C%20${longitudeIP}`,
            type: 'GET',
            dataType: 'json'
        })
        .done(function(data) {
            return cb(data)
            })
        .fail(() => {
            console.log('erro na requisição latitude e longitude')
        })
    }, 500)
}



async function graphicFunction(hour) {
    let setHour = hour.map(x => x[1])
    let setTemp = hour.map(x => +x[0])
    await Highcharts.chart('container', {

        title: {
            text: 'Temperatura hora a hora',
            align: 'center'
        },
    
    
        yAxis: {
            title: {
                text: 'Number of Employees'
            }
        },
    
        xAxis: {
            accessibility: {
                rangeDescription: `Range: ${setHour[0]} to ${setHour[setHour.length - 1]}`
            }
        },
    
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },
    
        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false
                },
                pointStart: +setHour[0]
            }
        },
    
        series: [ {
            data: [...setTemp]
        }],
    
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 600
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }
    });
    
}

/* CIDADE LOCALIZAÇÃO */
function dateState(dado) {
    const city = dado.EnglishName
    const state = dado.AdministrativeArea.EnglishName
    const country = dado.Country.LocalizedName
    $('#texto_local').html(`${city}, ${state}, ${country}`)
}

getGeo(dateState)
getGeo(info)
//ilyhm



});