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

const TERMS = `欢迎使用 SkyXing。

1. 账号的所有权与使用
SkyXing 账号的所有权归 SkyXing 所有，您获得的是账号的使用权。您不得将账号赠与、借用、租用、转让或出售。
您需对注册信息的真实性负责，并妥善保管账号与密码。因账号保管不善导致的损失由您自行承担。
若您长期不登录账号，SkyXing 有权对账号进行回收处理。

2. 内容规范
您在使用 SkyXing 时发布的内容须遵守法律法规，不得包含违法、色情、暴力、侵权或垃圾广告等信息。
SkyXing 不对平台上非 SkyXing 官方发布的内容的真实性、完整性或合法性作任何保证，也不承担由此产生的任何责任。
用户之间因内容产生的纠纷，由相关用户自行解决，SkyXing 不因此向任何一方承担责任。
您对发布的内容保留相关权利，并授予 SkyXing 为提供和展示服务所必需的使用权。
官方账号发布的内容视为 SkyXing 的官方信息。

3. 用户行为规范
不得利用平台从事违法活动或干扰平台正常运行。对于违规行为，SkyXing 有权删除内容、限制功能直至封禁账号。

4. 知识产权
SkyXing 平台的软件、界面、商标等知识产权归运营方所有。

5. 免责声明
本服务按「现状」提供。SkyXing 不对平台上非 SkyXing 官方发布的内容承担任何责任。
对于因网络、设备故障或不可抗力导致的服务中断或数据丢失，我们不承担责任。

6. 条款的变更
我们保留修改本条款的权利，修改后以平台公示版本为准。若您不同意修改后的条款，可停止使用本服务。

7. 联系我们
如有任何疑问，可通过 GitHub 提交 Issue 与我们联系。`;

export default function PrivacyPage() {
  const [tab, setTab] = useState('privacy');

  const TABS = [
    { key: 'privacy', label: '隐私政策', icon: ShieldAlert },
    { key: 'terms', label: '服务条款', icon: FileSignature },
  ];

  return (
    <div className="min-h-full flex flex-col">
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
