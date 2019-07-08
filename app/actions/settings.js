// @flow
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */

// eslint-disable-next-line import/newline-after-import
import axios from 'axios';
import type { Dispatch, SettingModel } from '../reducers/types';

export const SET_SETTINGS_DATA = 'SET_SETTINGS_DATA';

function setSettingsData(newSetting: SettingModel) {
  return {
    type: SET_SETTINGS_DATA,
    payload: newSetting
  };
}
function getAccessToken(host: string, username: string, password: string) {
  return new Promise((resolve, reject) => {
    axios
      .post(`${host}/auth/token/`, {
        username,
        password
      })
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}
const init: boolean = true;
export function saveSettingsData(
  payload: SettingModel,
  neededToken: boolean = init
) {
  const newSettings: SettingModel = payload;
  return async (dispatch: Dispatch) => {
    if (!neededToken) {
      localStorage.setItem('settingObject', JSON.stringify(newSettings));
      return dispatch(setSettingsData(newSettings));
    }
    newSettings.pagestatus.status = 1;
    dispatch(setSettingsData(newSettings));
    try {
      const access_token = await getAccessToken(
        payload.sproot_config.url_sproot_api,
        payload.credential.username,
        payload.credential.password
      );
      newSettings.access_token = access_token.token;
      newSettings.pagestatus = {
        status: 0,
        type: 'success',
        description: `Successfully set default configuration...`
      };
      dispatch(setSettingsData(newSettings));
    } catch (e) {
      newSettings.access_token = '';
      newSettings.pagestatus = {
        status: 0,
        type: 'error',
        description: 'Please check again your Credentials and Sproot API URL.'
      };
      dispatch(setSettingsData(newSettings));
    }
    newSettings.pagestatus = {
      status: 0,
      type: '',
      description: ''
    };
    localStorage.setItem('settingObject', JSON.stringify(newSettings));
    return dispatch(setSettingsData(newSettings));
  };
}

export function loadSettingsData() {
  return (dispatch: Dispatch) => {
    // eslint-disable-next-line camelcase
    let local_setting: SettingModel = localStorage.getItem('settingObject');
    if (local_setting === null) {
      local_setting = {
        credential: {
          username: '',
          password: ''
        },
        sproot_config: {
          url_sproot_api: '',
          sfqdn: [],
          lfqdn: [],
          default_human_red_url: '',
          default_bot_red_url: '',
          default_error_red_url: ''
        },
        extra_urls: {
          url_charge_api: '',
          url_extraction_api: ''
        },
        default_proxy_config: {
          proxy_type: '',
          proxy_address: '',
          port: '',
          credential: {
            username: '',
            password: ''
          }
        },
        access_token: '',
        pagestatus: {
          status: 0,
          type: '',
          description: ''
        }
      };
      localStorage.setItem('settingObject', JSON.stringify(local_setting));
    } else {
      local_setting = JSON.parse(local_setting);
    }
    dispatch(setSettingsData(local_setting));
  };
}
