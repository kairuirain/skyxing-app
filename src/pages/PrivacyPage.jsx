import { useState } from 'react';
import SubPageHeader from '../components/SubPageHeader';
import { ShieldAlert, FileSignature } from 'lucide-react';

const PRIVACY = `我们非常重视你的隐私。本政策说明 SkyXing 如何收集、使用与保护你的信息。

1. 我们收集的信息
- 你注册时提供的用户名、邮箱与密码（密码以单向加密方式存储，我们无法还原）；
- 你主动发布的文章、评论与个人资料（昵称、简介、头像）；
- 为提供私信功能而产生的消息内容。

2. 信息的使用
我们仅将信息用于提供和改进产品功能（如展示你的文章、推送通知、账号安全校验），不会出售你的个人信息。

3. 信息的存储与安全
数据存放于受控的云服务中。我们采取加密传输等合理措施保护你的数据，但请妥善保管你的账号密码。

4. 你的权利
你可以随时在「账号信息」中修改个人资料，或在「账号安全 - 注销账号」中删除你的账号及关联数据。

5. 联系我们
如有任何隐私疑问，可通过 GitHub 仓库提交 Issue 与我们联系。`;

const TERMS = `欢迎使用 SkyXing。使用本服务即表示你同意以下条款。

1. 账号责任
你需对账号下的所有活动负责，并妥善保管登录凭证。请勿将账号用于违法违规内容传播。

2. 内容规范
你发布的内容须遵守法律法规，不得包含暴力、色情、侵犯他人权益或垃圾广告等信息。我们有权对违规内容进行删除或限制。

3. 知识产权
你保留所发布内容的著作权；你授予 SkyXing 在平台内展示、存储该内容的权利。

4. 服务变更与终止
我们可能根据需要调整或停止部分功能。对于免费提供的服务，我们将尽合理努力提前通知重大变更。

5. 免责声明
本服务按「现状」提供。对于因网络、第三方服务或不可抗力导致的服务中断，我们不承担责任。

6. 条款更新
我们可能不时更新本条款，更新后以平台公示版本为准。`;

export default function PrivacyPage() {
  const [tab, setTab] = useState('privacy');

  const TABS = [
    { key: 'privacy', label: '隐私政策', icon: ShieldAlert },
    { key: 'terms', label: '用户协议', icon: FileSignature },
  ];

  return (
    <div className="min-h-full flex flex-col animate-fadeIn">
      <SubPageHeader title="隐私条款和用户协议" />

      <div className="px-4 pt-3">
        <div className="flex gap-2 bg-[var(--win-pane)] p-1 rounded-xl">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={
                  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-medium transition-colors ' +
                  (active ? 'bg-[var(--win-card)] text-[var(--win-accent)] shadow-sm' : 'text-[var(--win-text-secondary)]')
                }
              >
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto win-scroll px-5 py-4">
        <article className="text-[13px] leading-relaxed text-[var(--win-text-secondary)] whitespace-pre-wrap animate-fadeInUp">
          {tab === 'privacy' ? PRIVACY : TERMS}
        </article>
        <p className="text-[11px] text-[var(--win-text-tertiary)] mt-6 text-center">最后更新：2026-07-19</p>
      </div>
    </div>
  );
}
