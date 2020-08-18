/**
 * @file 搜索依赖模态框的item
 * @author sunxiaoyu333
 */

import Component from '@lib/san-component';
import {Notification} from 'santd';
import './dependency-search-item.less';
import DEPENDENCY_INSTALL from '@graphql/dependency/dependency-install.gql';

export default class DependenceSearchItem extends Component {
    static template = /* html */`
        <s-spin size="large" spinning="{{spinning}}" tip="{{loadingTip}}">
            <div class="dependency-search-item" slot="content">
                <a href="{{data.package.links.npm}}" target="_blank" class="pkg-check">
                    <div class="pkg-icon" style="background-image: url({{authorAvatar}})"></div>
                </a>
                <div class="pkg-name-wrap">
                    <a href="{{data.package.links.npm}}" target="_blank" class="pkg-check">{{data.package.name}}</a>
                    <span class="pkg-version">{{data.package.version}}</span>
                    <div class="pkg-description">{{data.package.description}}</div>
                </div>
                <s-button class="pkg-btn-operate" on-click="onInstallPlugin">{{$t('dependency.install')}}</s-button>
            </div>
        </s-spin>
    `;

    static computed = {
        authorAvatar() {
            return `https://s.gravatar.com/avatar/${
                require('md5')(this.data.get('data.package.publisher.email'))
            }?default=retro`;
        }
    }

    initData() {
        return {
            loadingTip: '',
            spinning: false
        };
    }

    // 设置加载显示的提示条
    async inited() {
        this.data.set('loadingTip', this.$t('dependency.installing'));
    }

    // 点击安装
    async onInstallPlugin(e) {
        this.data.set('spinning', true);
        await this.$apollo.mutate({
            mutation: DEPENDENCY_INSTALL,
            variables: {
                id: this.data.get('data').package.name,
                type: this.data.get('installType')
            }
        });
        // 暂停加载状态
        this.data.set('spinning', false);
        Notification.open({
            message: this.$t('dependency.installDependency'),
            description: this.$t('dependency.installSuccess')
        });
    }
}
