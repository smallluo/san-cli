/**
 * @file 配置详情组件
 * @author zttonly
 */

import Component from '@lib/san-component';
import {LAYOUT_ONE_THIRD} from '@lib/const';
import {getVisiblePrompts} from '@lib/utils/prompt';
import CONFIGURATION from '@graphql/configuration/configuration.gql';
import CONFIGURATION_SAVE from '@graphql/configuration/configurationSave.gql';
import CONFIGURATION_CANCEL from '@graphql/configuration/configurationCancel.gql';
import PROMPT_ANSWER from '@graphql/prompt/promptAnswer.gql';
import PromptsList from '../prompts-form/prompts-form';


export default class ConfigContent extends Component {

    static template = /* html */`
        <div class="config-content">
            <div class="tabs" s-if="config.tabs && config.tabs.length > 0">
                <s-radio-group s-if="config.tabs.length > 1" on-change="handleSizeChange" name="size">
                    <s-radio-button s-for="tab in config.tabs">{{tab.label}}</s-radio-button>
                </s-radio-group>
                <c-prompts s-ref="configForm"
                    form-item-layout="{{formItemLayout}}"
                    hide-submit-btn="{{true}}"
                    prompts="{=visiblePrompts=}"
                    on-submit="save"
                    on-valuechanged="onConfigChange"
                />
            </div>
            <div class="actions-bar" s-if="config">
                <s-button s-if="config.link" class="more" size="large" href="{{config.link}}">
                    {{$t('config.actions.more')}}
                </s-button>
                <s-button class="cancel" size="large" disabled="{=!hasPromptsChanged=}">
                    {{$t('config.actions.cancel')}}
                </s-button>
                <s-button s-if="!hasPromptsChanged" type="primary" class="refresh" size="large">
                    {{$t('config.actions.refresh')}}
                </s-button>
                <s-button s-else 
                    type="primary"
                    class="save"
                    size="large"
                    on-click="saveConfig"
                >{{$t('config.actions.save')}}</s-button>
            </div>
        </div>
    `;

    static computed = {
        visiblePrompts() {
            let currentTab = this.data.get('currentTab');
            let tabs = this.data.get('config.tabs');
            return getVisiblePrompts(tabs ? tabs[currentTab] : null);
        }
    };

    initData() {
        return {
            config: {},
            hasPromptsChanged: false,
            currentTab: 0,
            selected: false,
            formItemLayout: LAYOUT_ONE_THIRD
        };
    }

    static components = {
        'c-prompts': PromptsList
    };

    saveConfig() {
        this.ref('configForm').handleSubmit();
    }

    async onConfigChange({prompt, value}) {
        this.data.set('hasPromptsChanged', true);
        await this.$apollo.mutate({
            mutation: PROMPT_ANSWER,
            variables: {
                input: {
                    id: prompt.id,
                    value: JSON.stringify(value)
                }
            },
            update: (store, {data: {promptAnswer}}) => {
                let vars = {
                    id: this.data.get('config.id')
                };
                const data = store.readQuery({query: CONFIGURATION, variables: vars});
                const result = {};
                for (const prompt of promptAnswer) {
                    const list = result[prompt.tabId] || (result[prompt.tabId] = []);
                    list.push(prompt);
                }
                for (const tabId in result) {
                    if (result.hasOwnProperty(tabId)) {
                        data.configuration.tabs.find(t => t.id === tabId).prompts = result[tabId];
                    }
                }
                store.writeQuery({query: CONFIGURATION, variables: vars, data});
            }
        });
    }
    async save() {
        await this.$apollo.mutate({
            mutation: CONFIGURATION_SAVE,
            variables: {
                id: this.data.get('config.id')
            }
        });
        this.fire('refetch');
    }
    async cancel() {
        await this.$apollo.mutate({
            mutation: CONFIGURATION_CANCEL,
            variables: {
                id: this.data.get('config.id')
            }
        });

        this.fire('refetch');
    }
}
