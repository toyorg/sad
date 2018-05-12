const axios = require("axios");
const _ = require('lodash');
const moment = require('moment');
const inquirer = require('inquirer');
const fs = require('fs');
const request = require('request');
const progress = require('request-progress');
const log = require('single-line-log').stdout;

const twodays = moment().subtract(2, 'd').format('YYYY-MM-DD');
const oneday = moment().subtract(1, 'd').format('YYYY-MM-DD');
const today = moment().format('YYYY-MM-DD');
var progs = []
var channels = [{"value":"2","name":"Интер"},{"value":"33","name":"СТБ"},{"value":"10","name":"1+1"},{"value":"26","name":"ICTV"},{"value":"34","name":"Новый канал"},{"value":"22","name":"2+2"},{"value":"38","name":"Україна"},{"value":"220","name":"НСТ"},{"value":"1217","name":"КиноПремиум HD"},{"value":"68","name":"Остросюжетное HD"},{"value":"216","name":"ViP Megahit"},{"value":"217","name":"ViP Comedy"},{"value":"218","name":"ViP Premiere"},{"value":"128","name":"Кинопремьера HD"},{"value":"76","name":"Кинохит"},{"value":"106","name":"Киносемья"},{"value":"73","name":"Киномикс"},{"value":"74","name":"Киносвидание"},{"value":"83","name":"Кинокомедия"},{"value":"1321","name":"HBO HD"},{"value":"4298","name":"HBO 2 HD"},{"value":"4299","name":"HBO 3 HD"},{"value":"1052","name":"Filmbox Extra PL"},{"value":"1051","name":"Cinemax HD"},{"value":"1318","name":"Cinemax 2 HD"},{"value":"4251","name":"Canal+ Film HD"},{"value":"4247","name":"Canal+ Family HD"},{"value":"4661","name":"Paramount Channel HD PL"},{"value":"4264","name":"Polsat Film HD"},{"value":"270","name":"Kino Polska"},{"value":"4255","name":"Ale kino+ HD"},{"value":"4031","name":"FOX HD PL"},{"value":"4032","name":"FOX Comedy HD PL"},{"value":"4710","name":"TVN Fabuła HD"},{"value":"1175","name":"CC HD PL"},{"value":"4668","name":"CC Family HD PL"},{"value":"235","name":"Россия 1 HD"},{"value":"37","name":"ТНТ"},{"value":"197","name":"Первый HD"},{"value":"4066","name":"13 Ulica HD"},{"value":"1319","name":"AXN HD PL"},{"value":"4675","name":"AXN Spin HD PL"},{"value":"1056","name":"AXN White"},{"value":"1112","name":"AXN Black"},{"value":"4656","name":"SciFi HD PL"},{"value":"1085","name":"TVP Seriale"},{"value":"4252","name":"Canal+ Seriale HD"},{"value":"4840","name":"Epic Drama PL"},{"value":"66","name":"RTVi"},{"value":"915","name":"Мир"},{"value":"1095","name":"Мир HD"},{"value":"77","name":"РЕН"},{"value":"4114","name":"НТВ HD"},{"value":"926","name":"ТВЦ"},{"value":"1346","name":"Дождь"},{"value":"303","name":"Пятница"},{"value":"4508","name":"ABC HD US"},{"value":"4509","name":"CBS HD US"},{"value":"4510","name":"NBC HD US"},{"value":"4727","name":"RTL HD"},{"value":"4734","name":"TVP Polonia"},{"value":"4743","name":"TVP Kultura"},{"value":"4306","name":"TV6 HD"},{"value":"4300","name":"BBC HD PL"},{"value":"1053","name":"Canal+ HD PL"},{"value":"1317","name":"Polsat HD"},{"value":"4366","name":"Polsat 2 HD"},{"value":"4324","name":"Super Polsat HD"},{"value":"4367","name":"Polsat Play HD"},{"value":"1091","name":"ATM Rozrywka"},{"value":"4843","name":"Metro"},{"value":"4302","name":"BBC Earth HD"},{"value":"4099","name":"BBC Brit HD"},{"value":"4778","name":"BBC Lifestyle HD PL"},{"value":"4268","name":"TTV HD"},{"value":"4588","name":"TNT HD"},{"value":"1334","name":"Sundance HD"},{"value":"4254","name":"Kuchnia+ HD"},{"value":"4260","name":"Domo+ HD"},{"value":"1024","name":"HGTV HD"},{"value":"131","name":"Discovery HD"},{"value":"152","name":"Animal Planet HD"},{"value":"932","name":"Discovery"},{"value":"9","name":"DTX"},{"value":"1203","name":"History HD PL"},{"value":"4476","name":"H2 HD PL"},{"value":"4372","name":"Canal+ Discovery HD"},{"value":"125","name":"Discovery Science"},{"value":"148","name":"National Geographic HD"},{"value":"935","name":"National Geographic"},{"value":"164","name":"Nat Geo Wild HD"},{"value":"943","name":"Viasat Nature/History HD"},{"value":"124","name":"Viasat Nature"},{"value":"123","name":"Viasat History"},{"value":"23","name":"2x2"},{"value":"28","name":"К1"},{"value":"29","name":"К2"},{"value":"222","name":"Дом Кино"},{"value":"4382","name":"Дом Кино Премиум"},{"value":"920","name":"Cinema"},{"value":"90","name":"Мужское кино"},{"value":"219","name":"HD Life"},{"value":"297","name":"History HD"},{"value":"298","name":"TLC HD"},{"value":"8","name":"TLC Russia"},{"value":"134","name":"365 дней"},{"value":"304","name":"История"},{"value":"4305","name":"Viasat History Polsat HD"},{"value":"1259","name":"13th Street HD"},{"value":"147","name":"НЛО ТВ"},{"value":"299","name":"Travel Channel HD"},{"value":"1263","name":"Fine Living"},{"value":"169","name":"Россия К"},{"value":"4904","name":"Boomerang HD PL"},{"value":"96","name":"Ностальгия"},{"value":"828","name":"Время"},{"value":"80","name":"СТС"},{"value":"4056","name":"СТС Int"},{"value":"283","name":"Че"},{"value":"942","name":"Viasat Sport HD"},{"value":"296","name":"Наш футбол HD"},{"value":"146","name":"Cartoon Network"},{"value":"133","name":"Nickelodeon"},{"value":"203","name":"Nickelodeon Europe HD"},{"value":"157","name":"Nick Jr"},{"value":"295","name":"МАТЧ! Футбол 1 HD"},{"value":"275","name":"МАТЧ! Футбол 2 HD"},{"value":"153","name":"МАТЧ! Футбол 3 HD"},{"value":"69","name":"МАТЧ! Арена HD"},{"value":"129","name":"МАТЧ! Игра HD"},{"value":"4536","name":"МАТЧ! HD"},{"value":"855","name":"МАТЧ! Наш спорт"},{"value":"4","name":"Eurosport 1 HD"},{"value":"231","name":"Eurosport 2 HD NE"},{"value":"906","name":"Мульт"},{"value":"158","name":"Disney"},{"value":"4495","name":"Eleven Sports 1"},{"value":"4054","name":"Eleven Sports 2"},{"value":"4293","name":"nSport+ HD"},{"value":"1302","name":"Беларусь 5"},{"value":"215","name":"Super Tennis HD"},{"value":"87","name":"МАТЧ! Боец"},{"value":"1343","name":"Fightbox HD"},{"value":"4297","name":"TVP Sport HD"},{"value":"975","name":"Canal+ Sport HD PL"},{"value":"1198","name":"Polsat Sport HD"},{"value":"1199","name":"Polsat Sport Extra HD"},{"value":"4160","name":"Eurosport 1 HD PL"},{"value":"4181","name":"Eurosport 2 HD PL"},{"value":"4590","name":"Extreme Sports HD"},{"value":"4477","name":"CBC Sport HD"},{"value":"4375","name":"M. Deportes HD"},{"value":"4373","name":"M. Deportes 2 HD"},{"value":"4670","name":"Nova Sport 1 HD CZ"},{"value":"4824","name":"Nova Sport 2 HD CZ"},{"value":"1184","name":"BT Sport 1"},{"value":"1185","name":"BT Sport 2"},{"value":"4527","name":"AFN Sports"},{"value":"1032","name":"TRT 1"},{"value":"18","name":"Star TV"},{"value":"1099","name":"Kanal D HD"},{"value":"1100","name":"Show TV"},{"value":"1101","name":"ATV Türkiye"},{"value":"1137","name":"Teve 2"},{"value":"4067","name":"A Spor"},{"value":"1144","name":"NTV Türkiye"},{"value":"1120","name":"A Haber"},{"value":"1151","name":"MinikaGo"},{"value":"311","name":"Paramount comedy"},{"value":"119","name":"Fox HD"},{"value":"111","name":"Fox Life HD"},{"value":"127","name":"Amedia Premium HD"},{"value":"4418","name":"Amedia Hit HD"},{"value":"1321","name":"HBO HD"},{"value":"4298","name":"HBO 2 HD"},{"value":"4299","name":"HBO 3 HD"},{"value":"208","name":"Звезда"},{"value":"4398","name":"TV Puls HD"},{"value":"4559","name":"TVN HD"},{"value":"4273","name":"TVN 7 HD"},{"value":"4558","name":"TVN 24 HD"},{"value":"4478","name":"TVN Style HD"},{"value":"4183","name":"TVN Turbo HD"},{"value":"992","name":"TVP HD"},{"value":"4301","name":"TVP 1 HD"},{"value":"1320","name":"TVP 2 HD"},{"value":"1062","name":"Animal Planet HD PL"},{"value":"1063","name":"National Geographic HD PL"},{"value":"1057","name":"Nat Geo Wild HD PL"},{"value":"1086","name":"ID HD PL"},{"value":"4292","name":"TLC PL"},{"value":"4637","name":"Planete+ HD PL"},{"value":"4290","name":"Discovery HD PL"},{"value":"4595","name":"Discovery Science HD PL"},new inquirer.Separator()]


const get_channel_epg = async (channel_id, date, page, token, mac) => {
    try {
        const response = await axios.get('http://play.rezt.us/stalker_portal/server/load.php?type=epg&action=get_simple_data_table&ch_id=' + channel_id + '&date=' + date + '&p=' + page, {
            headers: {
                'Referer': 'http://play.rezt.us/stalker_portal/c/index.html?referrer=file:///home/web/services.htm',
                'Authorization': 'Bearer ' + token,
                'X-User-Agent': 'Model: MAG250; Link:',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0',
                'Cookie': 'mac=' + mac + '; stb_lang=en; timezone=Europe/Warsaw; adid=0'
            }
        });
        data = response.data;
        var int;
        data = _.filter(data['js']['data'], ['mark_archive', 1]);
        for (int = 0; int < _.size(data); int++) {
            progs.push({
                value: data[int]['id'],
                name: data[int]['name']
            })
        }
        return response.data['js']['total_items']
    } catch (error) {
        console.log(error);
    }
};


const get_download_link = async (prog_id, token, mac) => {
    try {
        const response = await axios.get('http://play.rezt.us/stalker_portal/server/load.php?type=tv_archive&action=create_link&cmd=auto%20/media/' + prog_id + '.mpg&series=&forced_storage=&disable_ad=1&download=1&force_ch_link_check=0&JsHttpRequest=1-xml', {
            headers: {
                'Referer': 'http://play.rezt.us/stalker_portal/c/index.html?referrer=file:///home/web/services.htm',
                'Authorization': 'Bearer ' + token,
                'X-User-Agent': 'Model: MAG250; Link:',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0',
                'Cookie': 'mac=' + mac + '; stb_lang=en; timezone=Europe/Warsaw; adid=0'
            }
        });
        const data = response.data;
        var int;
        console.log('URL: ' + data['js']['download_cmd'] + '\n');
        progress(request(data['js']['download_cmd']), {})
            .on('progress', function (state) {
                log('Downloaded: ' + (state.size.transferred / 1000000).toFixed(2) + ' MB/' + (state.size.total / 1000000).toFixed(2) + ' MB | ' + (state.percent * 100).toFixed(2) + ' % | ' + (state.speed * 0.000001).toFixed(2) + ' MB/s | ETA ' + state.time.remaining + ' s');
            })
            .on('error', function (err) {
                console.log('\nSomething went wrong!\n' + err);
                fs.unlink(data['js']['to_file']);
            })
            .on('end', function () {
                console.log('\nFinished!');
            })
            .pipe(fs.createWriteStream(data['js']['to_file']));
    } catch (error) {
        console.log(error);
    }
};


const get_token = async (mac) => {
    try {
        const response = await axios.get('http://play.rezt.us/stalker_portal/server/load.php?type=stb&action=handshake', {
            headers: {
                'Referer': 'http://play.rezt.us/stalker_portal/c/index.html?referrer=file:///home/web/services.htm',
                'X-User-Agent': 'Model: MAG250; Link:',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0',
                'Cookie': 'mac=' + mac + '; stb_lang=en; timezone=Europe/Warsaw; adid=0'
            }
        });
        const data = response.data;
        if (data['js']['token'] == undefined) {
            console.log('Try again!');
            process.exit();
        }
        return data['js']['token']
    } catch (error) {
        console.log(error);
    }
};


const get_profile = async (token, timestamp, mac) => {
    try {
        const response = await axios.get('http://play.rezt.us/stalker_portal/server/load.php?type=stb&action=get_profile&hd=1&ver=ImageDescription:%200.2.16-r2;%20ImageDate:%20Fri%20Oct%2025%2017:28:41%20EEST%202013;%20PORTAL%20version:%205.2.0;%20API%20Version:%20JS%20API%20version:%20328;%20STB%20API%20version:%20134;%20Player%20Engine%20version:%200x566&num_banks=1&sn=012012N01212&stb_type=MAG250&client_type=STB&image_version=216&video_out=hdmi&device_id=&device_id2=&signature=&auth_second_step=0&hw_version=1.7-BD-00&not_valid_token=0&metrics=%7B%22mac%22%3A%22' + mac + '%22%2C%22sn%22%3A%22012012N01212%22%2C%22model%22%3A%22MAG250%22%2C%22type%22%3A%22STB%22%2C%22uid%22%3A%22%22%2C%22random%22%3A%22f458cd96fc4c77caedd7b9d802e716ffa28fec0b%22%7D&hw_version_2=ocI73t2lwJLCCVxfzDarD1CfuPY=&timestamp=' + timestamp + '&api_signature=215&prehash=eGDESVA/0yhol/dGCQOABJBd54U=&JsHttpRequest=1-xml', {
            headers: {
                'Referer': 'http://play.rezt.us/stalker_portal/c/index.html?referrer=file:///home/web/services.htm',
                'Authorization': 'Bearer ' + token,
                'X-User-Agent': 'Model: MAG250; Link:',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0',
                'Cookie': 'mac=' + mac + '; stb_lang=en; timezone=Europe/Warsaw; adid=0'
            }
        });
        const data = response.data;
    } catch (error) {
        console.log(error);
    }
};


const get_channels = async (token, page, mac) => {
    try {
        const response = await axios.get('http://play.rezt.us/stalker_portal/server/load.php?type=itv&action=get_ordered_list&genre=*&force_ch_link_check=&fav=0&sortby=number&hd=0&p=' + page + '&JsHttpRequest=1-xml', {
            headers: {
                'Referer': 'http://play.rezt.us/stalker_portal/c/index.html?referrer=file:///home/web/services.htm',
                'Authorization': 'Bearer ' + token,
                'X-User-Agent': 'Model: MAG250; Link:',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0',
                'Cookie': 'mac=' + mac + '; stb_lang=en; timezone=Europe/Warsaw; adid=0'
            }
        });
        data = response.data;
        data = _.filter(data['js']['data'], ['enable_tv_archive', 1]);
        fs.appendFileSync('channels.txt', '[', 'utf8');
        for (int = 0; int < _.size(data); int++) {
            if (data[int]['name'] == undefined) {
                fs.appendFileSync('channels.txt', '{"value":"' + data[int]['id'] + '","name":"' + data[int]['xmltv_id'] + '"},', 'utf8');
            } else {
                fs.appendFileSync('channels.txt', '{"value":"' + data[int]['id'] + '","name":"' + data[int]['name'] + '"},', 'utf8');
            }
        }
        fs.appendFileSync('channels.txt', 'new inquirer.Separator()]', 'utf8');
    } catch (error) {
        console.log(error);
    }
};


async function get_mac() {
    return new Promise(function (resolve, reject) {
        try {
            const mac = fs.readFileSync('mac.txt');
            resolve(mac)
        } catch (err) {
            if (err.code === 'ENOENT') {
                inquirer.prompt([{
                    type: 'input',
                    message: 'Type in your MAC address',
                    name: 'mac',
                    validate: function (value) {
                        var pass = value.match(/^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2})+$/i);
                        if (pass) {
                            return true;
                        }
                        return 'Please enter a valid MAC address!';
                    }
                }]).then(answer => {
                    fs.appendFileSync('mac.txt', answer.mac, 'utf8');
                    resolve(answer.mac)
                });
            } else {
                throw err;
            }
        }
    })
}

// for (i = 0; i < 99; i++) {
//     get_channels(token, i, mac);
// }

get_mac().then(mac => {
    mac = mac.toString('utf8');
    get_token(mac).then(data => {
        let token = data;
        get_profile(token, moment().unix(), mac).then(() => {
            inquirer
                .prompt([{
                    type: 'list',
                    message: 'Select TV channel',
                    name: 'id',
                    choices: channels,
                    pageSize: 15
                }])
                .then(channel => {
                    get_channel_epg(channel.id, twodays, 1, token, mac).then(data => {
                        var int;
                        for (int = 2; int <= Math.ceil(data); int++) {
                            get_channel_epg(channel.id, twodays, int, token, mac);
                        }
                    }).then(() => {
                        get_channel_epg(channel.id, oneday, 1, token, mac).then(data => {
                            var int;
                            for (int = 2; int <= Math.ceil(data); int++) {
                                get_channel_epg(channel.id, oneday, int, token, mac);
                            }
                        }).then(() => {
                            get_channel_epg(channel.id, today, 1, token, mac).then(data => {
                                var int;
                                for (int = 2; int <= Math.ceil(data); int++) {
                                    get_channel_epg(channel.id, today, int, token, mac);
                                }
                            }).then(prog => {
                                progs.push(new inquirer.Separator());
                                inquirer
                                    .prompt([{
                                        type: 'list',
                                        message: 'Select TV show',
                                        name: 'id',
                                        choices: progs,
                                        pageSize: 15
                                    }]).then(prog => {
                                        get_download_link(prog.id, token, mac);
                                    });
                            });
                        });
                    });
                });
        });
    });
});