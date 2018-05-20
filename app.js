const axios = require('axios');
const _ = require('lodash');
const dayjs = require('dayjs');
const inquirer = require('inquirer');
const fs = require('fs');
const request = require('request');
const progress = require('request-progress');
const log = require('single-line-log').stdout;
const Fuse = require('fuse.js');
const exec = require('child_process').exec;
const truncate = require('truncate');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const signale = require('signale');

const adapterSettings = new FileSync('settings.json');
const dbSettings = low(adapterSettings);
const adapterChannels = new FileSync('channels.json');
const dbChannels = low(adapterChannels);
const packageJson = require('./package.json');

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

const twodays = dayjs().subtract(2, 'd').format('YYYY-MM-DD');
const oneday = dayjs().subtract(1, 'd').format('YYYY-MM-DD');
const today = dayjs().format('YYYY-MM-DD');
const progs = [];

const getProgs = async (channelId, date, page, token, mac, url) => {
  try {
    const response = await axios.get(`${url}stalker_portal/server/load.php?type=epg&action=get_simple_data_table&ch_id=${channelId}&date=${date}&p=${page}`, {
      headers: {
        Referer: `${url}stalker_portal/c/index.html?referrer=file:///home/web/services.htm`,
        Authorization: `Bearer ${token}`,
        'X-User-Agent': 'Model: MAG250; Link:',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0',
        Cookie: `mac=${mac}; stb_lang=en; timezone=Europe/Warsaw; adid=0`,
      },
    });
    let data = response.data;
    data = _.filter(data.js.data, ['mark_archive', 1]);
    for (let int = 0; int < _.size(data); int += 1) {
      progs.push({
        value: data[int].id,
        name: truncate(data[int].name, 74, {
          ellipsis: '...',
        }),
      });
    }
    return response.data.js.total_items;
  } catch (e) {
    signale.fatal(new Error('Something went wrong!'));
  }
  return 0;
};


const getLink = async (progId, token, mac, url) => {
  try {
    const response = await axios.get(`${url}stalker_portal/server/load.php?type=tv_archive&action=create_link&cmd=auto%20/media/${progId}.mpg&series=&forced_storage=&disable_ad=1&download=1&force_ch_link_check=0&JsHttpRequest=1-xml`, {
      headers: {
        Referer: `${url}stalker_portal/c/index.html?referrer=file:///home/web/services.htm`,
        Authorization: `Bearer ${token}`,
        'X-User-Agent': 'Model: MAG250; Link:',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0',
        Cookie: `mac=${mac}; stb_lang=en; timezone=Europe/Warsaw; adid=0`,
      },
    });
    const data = response.data;
    inquirer
      .prompt([{
        type: 'list',
        message: 'What do you want to do',
        name: 'what',
        choices: [
          'Download',
          'Watch in VLC',
          'Link only',
        ],
        pageSize: 15,
      }]).then((answer) => {
        if (answer.what === 'Download') {
          progress(request(data.js.download_cmd), {})
            .on('progress', (state) => {
              log(`Progress: ${(state.size.transferred / 1000000).toFixed(2)} MB/${(state.size.total / 1000000).toFixed(2)} MB | ${(state.percent * 100).toFixed(2)} % | ${(state.speed * 0.000001).toFixed(2)} MB/s | ETA ${state.time.remaining} s`);
            })
            .on('error', () => {
              signale.fatal(new Error('Something went wrong while downloading!'));
              fs.unlink(data.js.to_file);
            })
            .on('end', () => {
              process.stdout.write('\n');
              signale.success('Finished!');
            })
            .pipe(fs.createWriteStream(data.js.to_file));
        } else if (answer.what === 'Watch in VLC') {
          exec(`vlc ${data.js.download_cmd}`);
          process.exit();
        } else if (answer.what === 'Link only') {
          signale.note(`${data.js.download_cmd}`);
        } else {
          signale.fatal(new Error('Something went wrong!'));
          process.exit();
        }
      });
  } catch (e) {
    signale.fatal(new Error('Something went wrong!'));
  }
};


const getToken = async (mac, url) => {
  try {
    const response = await axios.get(`${url}stalker_portal/server/load.php?type=stb&action=handshake`, {
      headers: {
        Referer: `${url}stalker_portal/c/index.html?referrer=file:///home/web/services.htm`,
        'X-User-Agent': 'Model: MAG250; Link:',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0',
        Cookie: `mac=${mac}; stb_lang=en; timezone=Europe/Warsaw; adid=0`,
      },
    });
    const data = response.data;
    if (data.js.token === undefined) {
      signale.fatal('Try again!');
      process.exit();
    }
    return data.js.token;
  } catch (e) {
    signale.fatal(new Error('Something went wrong!'));
  }
  return 0;
};


const getProfile = async (token, timestamp, mac, url) => {
  try {
    const response = await axios.get(`${url}stalker_portal/server/load.php?type=stb&action=get_profile&hd=1&ver=ImageDescription:%200.2.16-r2;%20ImageDate:%20Fri%20Oct%2025%2017:28:41%20EEST%202013;%20PORTAL%20version:%205.2.0;%20API%20Version:%20JS%20API%20version:%20328;%20STB%20API%20version:%20134;%20Player%20Engine%20version:%200x566&num_banks=1&sn=012012N01212&stb_type=MAG250&client_type=STB&image_version=216&video_out=hdmi&device_id=&device_id2=&signature=&auth_second_step=0&hw_version=1.7-BD-00&not_valid_token=0&metrics=%7B%22mac%22%3A%22${mac}%22%2C%22sn%22%3A%22012012N01212%22%2C%22model%22%3A%22MAG250%22%2C%22type%22%3A%22STB%22%2C%22uid%22%3A%22%22%2C%22random%22%3A%22f458cd96fc4c77caedd7b9d802e716ffa28fec0b%22%7D&hw_version_2=ocI73t2lwJLCCVxfzDarD1CfuPY=&timestamp=${timestamp}&api_signature=215&prehash=eGDESVA/0yhol/dGCQOABJBd54U=&JsHttpRequest=1-xml`, {
      headers: {
        Referer: `${url}stalker_portal/c/index.html?referrer=file:///home/web/services.htm`,
        Authorization: `Bearer ${token}`,
        'X-User-Agent': 'Model: MAG250; Link:',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0',
        Cookie: `mac=${mac}; stb_lang=en; timezone=Europe/Warsaw; adid=0`,
      },
    });
    return response;
  } catch (e) {
    signale.fatal(new Error('Something went wrong!'));
  }
  return 0;
};


const getChannels = async (token, page, mac, url) => {
  try {
    const response = await axios.get(`${url}stalker_portal/server/load.php?type=itv&action=get_ordered_list&genre=*&force_ch_link_check=&fav=0&sortby=number&hd=0&p=${page}&JsHttpRequest=1-xml`, {
      headers: {
        Referer: `${url}stalker_portal/c/index.html?referrer=file:///home/web/services.htm`,
        Authorization: `Bearer ${token}`,
        'X-User-Agent': 'Model: MAG250; Link:',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0',
        Cookie: `mac=${mac}; stb_lang=en; timezone=Europe/Warsaw; adid=0`,
      },
    });
    let data = response.data;
    data = _.filter(data.js.data, ['enable_tv_archive', 1]);
    for (let int = 0; int < _.size(data); int += 1) {
      if (!data[int].name) {
        dbChannels.get('channels')
          .push({
            value: data[int].id,
            name: data[int].xmltv_id,
          })
          .write();
      } else {
        dbChannels.get('channels')
          .push({
            value: data[int].id,
            name: data[int].name,
          })
          .write();
      }
    }
  } catch (e) {
    signale.fatal(new Error('Something went wrong!'));
  }
};


async function getMac() {
  return new Promise(((resolve, reject) => {
    try {
      const mac = dbSettings.get('settings').find('mac').value().mac;
      resolve(mac);
    } catch (err) {
      if (err.code === undefined) {
        inquirer.prompt([{
          type: 'input',
          message: 'Type in your MAC address',
          name: 'mac',
          validate(value) {
            const pass = value.match(/^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2})+$/i);
            if (pass) {
              return true;
            }
            return 'Please enter a valid MAC address!';
          },
        }]).then((answer) => {
          dbSettings.get('settings')
            .push({
              mac: answer.mac,
            })
            .write();
          resolve(answer.mac);
        });
      } else {
        reject(err);
        throw err;
      }
    }
  }));
}

async function getUrl() {
  return new Promise(((resolve, reject) => {
    try {
      const url = dbSettings.get('settings').find('url').value().url;
      resolve(url);
    } catch (err) {
      dbSettings.defaults({
        settings: [],
      }).write();
      if (err.code === undefined) {
        inquirer.prompt([{
          type: 'input',
          message: 'Type in your portal URL address',
          name: 'url',
          validate(value) {
            const pass = value.match(/[-a-zA-Z0-9@:%+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%+.~#?&//=]*)?/gi);
            if (pass) {
              return true;
            }
            return 'Please enter a valid portal URL address!\nAddress must look like this: http://example.com/';
          },
        }]).then((answer) => {
          dbSettings.get('settings')
            .push({
              url: answer.url,
            })
            .write();
          resolve(answer.url);
        });
      } else {
        reject(err);
        throw err;
      }
    }
  }));
}


function channelsSearch(answers, input) {
  const query = input || '';
  let channels = dbChannels.get('channels').value();
  channels = _.uniqWith(channels, _.isEqual);
  channels = _.orderBy(channels, ['name'], ['asc']);
  return new Promise(((resolve) => {
    const fuse = new Fuse(channels, {
      shouldSort: true,
      threshold: 0.3,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['name'],
    });
    const result = fuse.search(query);
    if (result.length === 0 && query.length === 0) {
      resolve(channels);
    } else if (query.length > 0) {
      resolve(result);
    }
  }));
}


const updateChecker = async () => {
  const response = await axios.get('https://api.github.com/repos/toyorg/stalker_archive_downloader/releases');
  const data = response.data[0];
  return data;
};


if (dbChannels.get('channels').size().value() === 0 || (process.argv.length > 1 && process.argv[2] === '-c')) {
  signale.pending('Channels will be updated in one moment.\n');
  dbChannels.setState({ channels: [] });
  getUrl().then((url) => {
    getMac().then((mac) => {
      getToken(mac, url).then((data) => {
        const token = data;
        getProfile(token, dayjs().unix(), mac, url).then(() => {
          for (let int = 0; int < 99; int += 1) {
            getChannels(token, int, mac, url);
          }
        });
      });
    });
  });
} else {
  updateChecker().then((git) => {
    if (packageJson.version < git.tag_name) signale.note(`There are newer version available!\n${git.html_url}\n`);
    getUrl().then((url) => {
      getMac().then((mac) => {
        getToken(mac, url).then((data) => {
          const token = data;
          getProfile(token, dayjs().unix(), mac, url).then(() => {
            inquirer
              .prompt([{
                type: 'autocomplete',
                message: 'Search for TV channel',
                name: 'id',
                source: channelsSearch,
                pageSize: 15,
                validate(val) { return val ? true : 'Type something!'; },
              }])
              .then((channel) => {
                getProgs(channel.id, twodays, 1, token, mac, url).then((data) => {
                  for (let int = 2; int <= Math.ceil(data); int += 1) {
                    getProgs(channel.id, twodays, int, token, mac, url);
                  }
                }).then(() => {
                  getProgs(channel.id, oneday, 1, token, mac, url).then((data) => {
                    for (let int = 2; int <= Math.ceil(data); int += 1) {
                      getProgs(channel.id, oneday, int, token, mac, url);
                    }
                  }).then(() => {
                    getProgs(channel.id, today, 1, token, mac, url).then((data) => {
                      for (let int = 2; int <= Math.ceil(data); int += 1) {
                        getProgs(channel.id, today, int, token, mac, url);
                      }
                    }).then(() => {
                      progs.push(new inquirer.Separator());
                      inquirer
                        .prompt([{
                          type: 'list',
                          message: 'Select TV show',
                          name: 'id',
                          choices: progs,
                          pageSize: 15,
                        }]).then((prog) => {
                          getLink(prog.id, token, mac, url);
                        });
                    });
                  });
                });
              });
          });
        });
      });
    });
  });
}
