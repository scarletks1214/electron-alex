/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
// @flow
// eslint-disable-next-line spaced-comment
//import { remote } from 'electron';
// eslint-disable-next-line import/newline-after-import
import axios from 'axios';
import { clipboard } from 'electron';
import type {
  Dispatch,
  SettingModel,
  LinkCreationModel,
  PageStatusModel
} from '../reducers/types';

export const SET_CREATE_LINK = 'SET_CREATE_LINK';

type Header = {
  'Content-Type': string,
  Authorization: string
};
// action
function setLinkSuccess(pagestatus: PageStatusModel) {
  return {
    type: SET_CREATE_LINK,
    payload: pagestatus
  };
}
// API

// Get Proxy link by ID
export function getProxyLink(settings: SettingModel, linkID: number) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      }
    };
    axios
      .get(
        `${settings.sproot_config.url_sproot_api}/revproxy/links/${linkID}`,
        config
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

// Get Proxy Link list
export function getProxyLinksByPage(
  settings: SettingModel,
  pageIndex: number = 1
) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      },
      params: {
        page: pageIndex
      }
    };
    axios
      .get(`${settings.sproot_config.url_sproot_api}/revproxy/links/`, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

// Get Proxy Link Detail By Id and page
export function getProxyLinkDetail(
  settings: SettingModel,
  link_id: number,
  page_id: number = 1
) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      },
      params: {
        link: link_id,
        page: page_id
      }
    };
    axios
      .get(`${settings.sproot_config.url_sproot_api}/revproxy/targets`, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

// Rules Operation:
//	Access_url: get rule by Access_urL
//	Rule_id: get rule by ID
export function getRules(
  settings: SettingModel,
  access_urls: string = '',
  rule_id: string = ''
) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      },
      params: {
        use_human_redirect: encodeURI(access_urls)
      }
    };
    axios
      .get(
        `${settings.sproot_config.url_sproot_api}/common/rules/${rule_id}`,
        config
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

// Get ShortLink By Rule ID
export function getShortLinkByRuleID(settings: SettingModel, rule_id: number) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      },
      params: {
        rules: rule_id
      }
    };
    axios
      .get(`${settings.sproot_config.url_sproot_api}/gateway/links/`, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

// Get ShortLink By Rule ID
export function deactiveProxylink(
  settings: SettingModel,
  newlinkData: any,
  link_id: number
) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      }
    };
    axios
      .put(
        `${settings.sproot_config.url_sproot_api}/revproxy/links/${link_id}/`,
        newlinkData,
        config
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

// BEGIN: Link Creation Process POST 1~4
function createRuleForProxyLink(linkCreateionData: LinkCreationModel, config) {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `${linkCreateionData.url_sproot_api}/common/rules/`,
        {
          name: linkCreateionData.name,
          is_mobile: true,
          is_pc: true,
          sfqdn: linkCreateionData.sfqdn,
          lfqdn: linkCreateionData.lfqdn,
          use_human_redirect: linkCreateionData.human_red_url,
          use_bot_redirect: linkCreateionData.bot_red_url,
          shortcode: linkCreateionData.short_code,
          ip_address: linkCreateionData.ip_address,
          autonomous_system_number: linkCreateionData.autonomous_system_number,
          country_code: linkCreateionData.country_code,
          region_code: linkCreateionData.region_code,
          device_brand: linkCreateionData.device_brand,
          os_family: linkCreateionData.os_family,
          browser_family: linkCreateionData.browser_family
        },
        config
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

function createProxyLink(
  linkCreateionData: LinkCreationModel,
  config,
  _id: number
) {
  return new Promise((resolve, reject) => {
    const body = {
      rules: [
        {
          id: _id
        }
      ],
      domains: [
        {
          name: linkCreateionData.lfqdn
        }
      ],
      original_host: linkCreateionData.service.toLowerCase(),
      use_proxies: true,
      use_deactivate_on_success: false,
      on_error_redirect: linkCreateionData.error_red_url,
      is_active: true,
      socks_settings: linkCreateionData.socks_settings,
      socks: linkCreateionData.socks,
      shortcode: linkCreateionData.short_code,
      description: 'Your description',
      notification: false
    };
    console.log(body, config);
    axios
      .post(`${linkCreateionData.url_sproot_api}/revproxy/links/`, body, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

function createRuleForShortLink(
  linkCreateionData: LinkCreationModel,
  config,
  human_redirect: string
) {
  return new Promise((resolve, reject) => {
    const body = {
      name: linkCreateionData.name,
      is_mobile: true,
      is_pc: true,
      use_human_redirect: human_redirect,
      use_bot_redirect: linkCreateionData.bot_red_url,
      ip_address: linkCreateionData.ip_address,
      autonomous_system_number: linkCreateionData.autonomous_system_number,
      country_code: linkCreateionData.country_code,
      region_code: linkCreateionData.region_code,
      device_brand: linkCreateionData.device_brand,
      os_family: linkCreateionData.os_family,
      browser_family: linkCreateionData.browser_family
    };

    axios
      .post(`${linkCreateionData.url_sproot_api}/common/rules/`, body, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

function createShortLink(
  linkCreateionData: LinkCreationModel,
  config,
  _id: number
) {
  return new Promise((resolve, reject) => {
    const body = {
      rules: [
        {
          id: _id
        }
      ],
      domains: [
        {
          name: linkCreateionData.sfqdn
        }
      ],
      on_error_redirect: linkCreateionData.error_red_url,
      description: 'Your description',
      notification: false,
      shortcode: linkCreateionData.short_code
    };

    axios
      .post(`${linkCreateionData.url_sproot_api}/gateway/links/`, body, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}
// END: Link Creation Process

// Create Link Action
export function createLink(payload: LinkCreationModel) {
  const linkCreateionData = payload;
  return async (dispatch: Dispatch) => {
    dispatch(setLinkSuccess({ status: 1, type: '', description: '' }));
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${linkCreateionData.access_token}`
        }
      };
      console.log('going to createRuleForProxyLink');
      const res1 = await createRuleForProxyLink(linkCreateionData, config);
      console.log('going to createProxyLink');

      const res2 = await createProxyLink(linkCreateionData, config, res1.id);
      console.log('going to createRuleForShortLink');
      const res3 = await createRuleForShortLink(
        linkCreateionData,
        config,
        res2.access_urls[0]
      );
      console.log('going to createShortLink');
      const res4 = await createShortLink(linkCreateionData, config, res3.id);
      clipboard.writeText(res4.access_urls[0]);
      dispatch(
        setLinkSuccess({
          status: 0,
          type: 'success',
          description: `Sproot link successfully created & Copied to Clipboard. ${
            res4.access_urls[0]
          }`
        })
      );
    } catch (e) {
      console.log(e.body);
      dispatch(
        setLinkSuccess({
          status: 0,
          type: 'error',
          description:
            'Please check that all Domains and URLs can be available.'
        })
      );
    }
    return dispatch(
      setLinkSuccess({
        status: 0,
        type: '',
        description: ''
      })
    );
  };
}

export function getDomains(settings: SettingModel, pageIndex: number = 1) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      },
      params: {
        page: pageIndex
      }
    };

    axios
      .get(`${settings.sproot_config.url_sproot_api}/geoloc/domains`, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

export function getTargetByID(settings: SettingModel, targetID: string) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      }
    };
    axios
      .get(
        `${
          settings.sproot_config.url_sproot_api
        }/revproxy/targets/${targetID}/`,
        config
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}
